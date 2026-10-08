export type AntaiFields = {
  numeroAvis: string;
  nomDestinataire: string;
  dateAvis: string;
};

export function formatAntaiPasteBlock(fields: AntaiFields): string {
  return `NUMERO_AVIS: ${fields.numeroAvis}\nNOM_DESTINATAIRE: ${fields.nomDestinataire}\nDATE_AVIS: ${fields.dateAvis}`;
}
