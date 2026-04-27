const knowledgeChunks = [
  {
    id: "cover-thesis",
    title: "Core thesis",
    sectionId: "cover",
    sourceLabel: "Presentation",
    tags: ["thesis", "houston", "pipeline"],
    content:
      "The presentation frames the opportunity as short-duration, asset-backed exposure to Houston infill where land scarcity, development momentum, and defined collateral can create a compelling lending entry point.",
  },
  {
    id: "opportunity",
    title: "Why now",
    sectionId: "opportunity",
    sourceLabel: "Presentation",
    tags: ["houston", "demand", "pipeline"],
    content:
      "The opportunity thesis depends on urban infill demand, migration, job formation, limited inner-city land supply, and the ability to participate before full vertical execution risk.",
  },
  {
    id: "investment-overview",
    title: "Investor structure",
    sectionId: "overview",
    sourceLabel: "Presentation",
    tags: ["terms", "collateral", "secured"],
    content:
      "The deck presents a secured promissory note with a 20 percent fixed return target, a 9 to 18 month term, and an asset-backed framing tied to real estate value.",
  },
  {
    id: "collateral-caution",
    title: "Pipeline versus collateral",
    sectionId: "portfolio",
    sourceLabel: "Presentation + Strike List",
    tags: ["collateral", "pipeline", "risk"],
    content:
      "The presentation uses the strike list as evidence of sourcing depth and pipeline activity. It should not be treated as proof that every listed target is already controlled collateral or already acquired inventory.",
  },
  {
    id: "strike-overview",
    title: "Strike list overview",
    sectionId: "portfolio",
    sourceLabel: "Strike List Update spreadsheet",
    tags: ["pipeline", "target", "houston"],
    content:
      "The strike list shows 33 sourced targets across 12 Houston zip pockets, including permit-backed sites, replatted lots, assemblages, and lender-ready small-cluster development opportunities.",
  },
  {
    id: "zip-distribution",
    title: "Zip concentration",
    sectionId: "portfolio",
    sourceLabel: "Strike List Update spreadsheet",
    tags: ["houston", "zip", "pipeline"],
    content:
      "The strongest concentration in the strike list is in 77004 and 77021, with additional coverage in 77028, 77043, 77006, 77007, 77020, 77080, and other Houston infill pockets.",
  },
  {
    id: "houston-rationale",
    title: "Why Houston",
    sectionId: "why-houston",
    sourceLabel: "Presentation",
    tags: ["houston", "market", "demand"],
    content:
      "Houston is presented as a market with scale, affordability, development pragmatism, multi-industry employment, and migration-driven household formation that supports repeatable infill activity.",
  },
  {
    id: "value-creation",
    title: "Value creation path",
    sectionId: "strategy",
    sourceLabel: "Presentation",
    tags: ["pipeline", "strategy", "exit"],
    content:
      "The strategy is acquire, entitle, and then exit or build. The deck emphasizes visible milestones before maturity rather than depending on one distant future outcome.",
  },
  {
    id: "green-river",
    title: "0 Green River Rd",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update + Agent Report",
    tags: ["pipeline", "target", "green river"],
    content:
      "0 Green River Rd in zip 77028 is marked Top Priority in the spreadsheet. The update says four lots have permits in place, and the agent report describes cleared, ready-to-build lots with permitted blueprints.",
  },
  {
    id: "ward-assemblage",
    title: "4305-4309 Ward",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update spreadsheet",
    tags: ["pipeline", "target", "ward"],
    content:
      "4305 Ward, 4307 Ward, and 4309 Ward are treated as a Foster Place three-unit assemblage. 4309 Ward is labeled Anchor Target and shovel-ready with plans.",
  },
  {
    id: "berry-st",
    title: "Berry Street lots",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update spreadsheet",
    tags: ["pipeline", "target", "berry", "replat"],
    content:
      "0 Berry St, 2 Berry St, 3 Berry St, and 4 Berry St are listed as four separate replatted lots in 77004, each shown as part of a coordinated infill opportunity.",
  },
  {
    id: "conley",
    title: "6701 Conley",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update + Agent Report",
    tags: ["pipeline", "target", "conley", "replat"],
    content:
      "6701 Conley in 77021 is flagged as a corner lot replatted for three units. The agent report also describes nearby builder relevance and adjacent target activity in the area.",
  },
  {
    id: "dennis",
    title: "3519 Dennis",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update spreadsheet",
    tags: ["pipeline", "target", "dennis", "permits"],
    content:
      "3519 Dennis in 77004 is marked Critical in the spreadsheet, with permits and plans in place, making it one of the clearest shovel-ready examples in the sourcing mix.",
  },
  {
    id: "wycliffe",
    title: "1218 Wycliffe",
    sectionId: "pipeline",
    sourceLabel: "Strike List Update + Agent Report",
    tags: ["pipeline", "target", "wycliffe", "lender ready"],
    content:
      "1218 Wycliffe in 77043 is presented as a five-lot patio house project. The spreadsheet calls it lender ready, and the agent report describes a small development where multiple homes or lots are already part of a coordinated plan.",
  },
  {
    id: "returns",
    title: "Illustrative returns",
    sectionId: "returns",
    sourceLabel: "Presentation",
    tags: ["terms", "return"],
    content:
      "The deck gives an illustrative example of 100,000 dollars growing to 120,000 dollars at maturity, but it consistently uses fixed return language rather than guaranteed return language.",
  },
  {
    id: "capital-stack",
    title: "Capital stack",
    sectionId: "capital",
    sourceLabel: "Presentation",
    tags: ["terms", "collateral", "senior debt"],
    content:
      "The presentation shows investors in a 20 percent senior debt position ahead of an 80 percent sponsor or broader capital layer, framing repayment priority as a key decision anchor.",
  },
  {
    id: "exit-paths",
    title: "Exit paths",
    sectionId: "exit",
    sourceLabel: "Presentation",
    tags: ["exit", "pipeline"],
    content:
      "The deck presents builder sales, portfolio sale, vertical development, and joint venture structures as multiple monetization paths rather than reliance on one single exit outcome.",
  },
  {
    id: "risk-mitigation",
    title: "Risk mitigation",
    sectionId: "risk",
    sourceLabel: "Presentation",
    tags: ["risk", "pipeline", "collateral"],
    content:
      "The deck frames market risk around liquid urban submarkets, permit risk around clearer entitlement trajectories, and liquidity risk around portfolio-level collateral support and staged monetization.",
  },
  {
    id: "terms-summary",
    title: "Investor terms summary",
    sectionId: "terms",
    sourceLabel: "Presentation",
    tags: ["terms", "secured", "collateral"],
    content:
      "The investor terms section emphasizes secured promissory note structure, fixed return, asset-backed framing, and defined maturity with minimal ambiguity.",
  },
  {
    id: "legal",
    title: "Legal framing",
    sectionId: "legal",
    sourceLabel: "Presentation",
    tags: ["legal", "risk", "collateral"],
    content:
      "The legal section describes the opportunity as private lending subject to documentation, underwriting, and applicable laws, with collateral support intended to be anchored in the real estate security structure.",
  },
];

const suggestedQuestions = [
  "What exactly is the investor getting here?",
  "Which strike-list targets look strongest right now?",
  "How should I think about collateral versus pipeline?",
  "Why is Houston a fit for this strategy?",
];

module.exports = {
  knowledgeChunks,
  suggestedQuestions,
};
