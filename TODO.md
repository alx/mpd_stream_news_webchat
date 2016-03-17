# beta v2
x ajouter *target=_blank* sur urls
x messages qui contiennent une url
x desactiver responsive en mono-colonne http://puu.sh/nJERC/c90aee5c42.jpg http://puu.sh/nJEPy/c0965b5a1e.jpg
x rajouter controle player music dans header colonne music
x overflow-x hidden sur colonne chat (long url)
- lenteur sur l'ajout de messages
- emitter.setMaxListeners()

(node) warning: possible EventEmitter memory leak detected. 11 listeners
added. Use emitter.setMaxListeners() to increase limit.
Trace
    at MPDClient.EventEmitter.addListener (events.js:160:15)
    at Namespace.module.exports
(/var/www/naissance.tactac.cat/routes/socket.js:222:13)
    at Namespace.EventEmitter.emit (events.js:95:17)
    at Namespace.emit
(/var/www/naissance.tactac.cat/node_modules/socket.io/lib/namespace.js:205:10)
    at
/var/www/naissance.tactac.cat/node_modules/socket.io/lib/namespace.js:172:14
    at process._tickCallback (node.js:415:13)

# beta v1
x CRITIQUE: erreur lors du "add" dans mpdClient
x MAJEUR: touche "Enter" sur formulaire (priorité messageForm)
x MAJEUR: BIBOT moins verbose (join/quit)
x MAJEUR: dimensionnement automatique des colonnes
x html raw sur BIBOT
x retirer contrôle de volume inactif
x barre de chargement accouchement
x ne pas afficher les messages vides sur le client
- bug de deconnexion, pas identifié
