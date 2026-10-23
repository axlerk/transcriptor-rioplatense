# Transcriptor fonético rioplatense

## Record every academic decision

Any decision about how Rioplatense Spanish is pronounced or transcribed
(adopting, changing or rejecting a rule, choosing a notation, grading the
evidence for an option) is recorded in the same commit as the change:

1. A new row in `docs/decisions.md` with the date, the decision, the source
   keys and the evidence level (verified / secondary / inferred / notation).
   A changed decision gets a new row that names the row it supersedes; old
   rows are not edited.
2. Every source goes into the Sources list in `docs/phonology.md`, the
   project's single bibliography, with its full citation, a URL when there
   is one, and what was actually read: full text, data sections, abstract,
   search snippet, or only a citation inside another work.
3. The rule's description and evidence column in `docs/phonology.md` are
   updated to match.
4. Searches that found nothing are recorded too (what was searched, when),
   so the same search is not repeated blindly.

A claim taken from a source we have not read is "secondary", however
reputable the citing work. Our own reasoning is "inferred", and it is said
so in the UI's rule card.
