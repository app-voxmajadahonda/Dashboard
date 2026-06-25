export type MunicipalElectionCycle = {
  electionYear: number;
  electionDate: string;
  constitutionDate: string;
  nextElectionYear: number;
  legalBasis: string;
  note: string;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getFourthSundayOfMay(year: number) {
  const date = new Date(Date.UTC(year, 4, 1));
  const firstSundayOffset = (7 - date.getUTCDay()) % 7;
  date.setUTCDate(1 + firstSundayOffset + 21);
  return date;
}

export function getMunicipalConstitutionDate(electionDate: Date) {
  const date = new Date(electionDate);
  date.setUTCDate(date.getUTCDate() + 20);
  return date;
}

export function getMunicipalElectionCycle(electionYear: number): MunicipalElectionCycle {
  const electionDate = getFourthSundayOfMay(electionYear);
  const constitutionDate = getMunicipalConstitutionDate(electionDate);

  return {
    electionYear,
    electionDate: toIsoDate(electionDate),
    constitutionDate: toIsoDate(constitutionDate),
    nextElectionYear: electionYear + 4,
    legalBasis: "LOREG arts. 42.3, 194 y 195",
    note:
      "Las elecciones municipales se celebran el cuarto domingo de mayo. La corporacion municipal se constituye el vigesimo dia posterior a la celebracion de las elecciones, salvo recurso contencioso-electoral."
  };
}
