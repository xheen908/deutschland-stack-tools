export interface WBAData {
  antrags_metadaten?: {
    dokumenten_typ: string | null;
    bewilligungszeitraum_ende: string | null;
    bg_nummer: string | null;
  };
  persoenliche_daten?: {
    vorname: string | null;
    nachname: string | null;
    geburtsdatum: string | null;
    anschrift: {
      strasse: string | null;
      hausnummer: string | null;
      plz: string | null;
      ort: string | null;
    } | null;
    wohnt_alleine: boolean | null;
  };
  kosten_unterkunft?: {
    kosten_geaendert: boolean | null;
    wohnart: string[] | null;
    miete: {
      grundmiete: number | null;
      nebenkosten: number | null;
      heizkosten: number | null;
    } | null;
    eigentum: {
      wohnflaeche_qm: number | null;
      zinsen_angekreuzt: boolean | null;
      nebenkosten_angekreuzt: boolean | null;
      heizkosten_angekreuzt: boolean | null;
    } | null;
  };
  einkommen?: {
    einkommen_vorhanden: boolean | null;
    details: Array<{
      person: string | null;
      art_des_einkommens: string | null;
      betrag_monatlich: number | null;
    }> | null;
    ausgaben_geaendert: boolean | null;
    freiberuflich: boolean | null;
    ehrenamt: boolean | null;
    sozialleistungen: boolean | null;
    weitere_einkommen: boolean | null;
  };
  aenderungen?: {
    familienverhaeltnisse_geaendert: boolean | null;
    ansprueche_dritte: boolean | null;
    unfall_schadenereignis: boolean | null;
    vergangene_aenderungen: boolean | null;
    sonstige_aenderungen_text: string | null;
  };
  abschluss?: {
    datum: string | null;
    unterschrift_vorhanden: boolean | null;
    unterschrieben_von: string | null;
  };
}
