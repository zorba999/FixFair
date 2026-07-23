# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class FixFair(gl.Contract):
    """
    FixFair - a decentralized warranty / repair-claim adjudicator.

    A single deployment behaves as a registry of escrow "cases". Each case
    stores the warranty terms in plain language. When a buyer files a claim,
    the Intelligent Contract judges that claim against the terms using an LLM
    and reaches validator consensus on the (subjective) verdict:
    refund / partial / reject.

    This is the core value of GenLayer: judgment + web verification with no
    human referee.
    """

    # case_id (string) -> json-encoded case object
    cases: TreeMap[str, str]
    next_id: u256

    def __init__(self):
        self.next_id = u256(0)

    # ------------------------------------------------------------------ #
    # Writes
    # ------------------------------------------------------------------ #
    @gl.public.write
    def create_case(
        self,
        seller: str,
        buyer: str,
        item: str,
        category: str,
        serial: str,
        warranty_terms: str,
        amount: str,
    ) -> str:
        """Open a new escrow case. Returns the new case id."""
        cid = str(self.next_id)
        case = {
            "id": cid,
            "seller": seller,
            "buyer": buyer,
            "item": item,
            "category": category,
            "serial": serial,
            "warranty_terms": warranty_terms,
            "amount": amount,
            "state": "funded",
            "claim": None,
            "verdict": None,
            "reason": None,
            "confidence": None,
        }
        self.cases[cid] = json.dumps(case)
        self.next_id = self.next_id + u256(1)
        return cid

    @gl.public.write
    def submit_claim(
        self,
        case_id: str,
        description: str,
        evidence_url: str,
        serial: str,
    ) -> typing.Any:
        """
        File a warranty claim on a case and let the contract adjudicate it.

        Phase 1 (optional): fetch evidence text from the web with strict
        consensus. Phase 2: adjudicate the claim against the warranty terms
        with a non-comparative equivalence principle (subjective judgment).
        """
        raw = self.cases.get(case_id, None)
        if raw is None:
            raise Exception("case not found")

        case = json.loads(raw)
        if case["state"] != "funded":
            raise Exception("case is not open for claims")

        terms = case["warranty_terms"]
        item = case["item"]

        # --- Phase 1: optional evidence fetch (deterministic consensus) ---
        evidence_text = ""
        if evidence_url:

            def fetch_evidence() -> str:
                resp = gl.nondet.web.get(evidence_url)
                return resp.body.decode("utf-8")[:2000]

            try:
                evidence_text = gl.eq_principle.strict_eq(fetch_evidence)
            except Exception:
                evidence_text = ""

        # --- Phase 2: adjudicate (subjective LLM judgment + consensus) ---
        payload = json.dumps(
            {
                "item": item,
                "warranty_terms": terms,
                "buyer_claim": description,
                "serial": serial,
                "evidence_excerpt": evidence_text,
            },
            sort_keys=True,
        )

        task = (
            "You are a neutral warranty adjudicator. The input JSON contains "
            "the warranty_terms, the item, the buyer_claim and any evidence. "
            "Decide, based ONLY on the warranty_terms, whether the claim "
            "should be accepted. Output STRICT JSON and nothing else, exactly "
            'in this shape: {"verdict": "refund" | "partial" | "reject", '
            '"reason": "<one short sentence>", "confidence": <integer 0-100>}. '
            "Use 'reject' when the described damage is excluded by the terms "
            "(for example physical damage, liquid damage, misuse) or is out of "
            "the warranty window. Use 'refund' for a clear covered "
            "manufacturer defect. Use 'partial' when only partially covered. "
            "Here is the case:\n" + payload
        )

        criteria = (
            "The response must be valid JSON with keys verdict, reason and "
            "confidence. verdict must be one of refund/partial/reject and must "
            "be justified only by the warranty_terms and the claim. Damage "
            "excluded by the terms must lead to reject."
        )

        raw_verdict = gl.eq_principle.prompt_non_comparative(
            lambda: payload,
            task=task,
            criteria=criteria,
        )

        data = _parse_verdict(raw_verdict)

        case["claim"] = {
            "description": description,
            "evidence_url": evidence_url,
            "serial": serial,
        }
        case["verdict"] = data.get("verdict")
        case["reason"] = data.get("reason")
        case["confidence"] = data.get("confidence")
        case["state"] = "resolved"
        self.cases[case_id] = json.dumps(case)
        return data

    # ------------------------------------------------------------------ #
    # Views
    # ------------------------------------------------------------------ #
    @gl.public.view
    def get_case(self, case_id: str) -> str:
        raw = self.cases.get(case_id, None)
        if raw is None:
            return ""
        return raw

    @gl.public.view
    def get_all_cases(self) -> str:
        return json.dumps([json.loads(v) for _, v in self.cases.items()])


def _parse_verdict(raw: str) -> dict:
    """Best-effort parse of the LLM verdict into a dict."""
    text = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass
        return {
            "verdict": "reject",
            "reason": "unparseable adjudication output",
            "confidence": 0,
        }
