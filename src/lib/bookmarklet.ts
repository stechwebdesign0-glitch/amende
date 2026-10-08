const BOOKMARKLET_SOURCE = `(function(){
  if (!location.hostname.includes('antai.gouv.fr')) {
    alert("Ouvrez d'abord le formulaire ANTAI (usagers.antai.gouv.fr), puis revenez appuyer sur ce favori.");
    return;
  }
  var raw = prompt('Collez ici le texte copié depuis l\\'app (bouton "Copier mes informations") :');
  if (!raw) return;
  function get(key) {
    var m = raw.match(new RegExp(key + '\\\\s*:\\\\s*(.+)'));
    return m ? m[1].trim() : null;
  }
  var numero = get('NUMERO_AVIS');
  var nom = get('NOM_DESTINATAIRE');
  var date = get('DATE_AVIS');
  function setVal(id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return false;
    var proto = Object.getPrototypeOf(el);
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    desc.set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }
  var ok1 = setVal('numeroDossier', numero);
  var ok2 = setVal('nomMisEnCause', nom);
  var ok3 = setVal('dateAvisOuDateEnvoi', date);
  if (!ok1 && !ok2 && !ok3) {
    alert("Champs introuvables sur cette page. Vérifiez que vous êtes bien sur l'écran d'identification du dossier.");
  }
})();`;

export function getBookmarkletHref(): string {
  return `javascript:${encodeURIComponent(BOOKMARKLET_SOURCE)}`;
}
