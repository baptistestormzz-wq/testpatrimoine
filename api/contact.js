export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        prenom,
        nom,
        email,
        telephone,
        statut,
        annee_naissance,
        situation_familiale,
        departement,
        revenus,
        contrats_en_cours,
        thematic_choices,
        autres_themas,
        bilan_precedent,
        horizon,
        situation_particuliere,
        budget
    } = req.body;

    // Configuration Brevo
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
        console.error('Brevo API key is missing.');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Construit le corps de l'email
    const htmlContent = `
    <h2>Nouveau Bilan Prévoyance & Patrimoine en ligne</h2>
    <h3>Informations de contact</h3>
    <ul>
      <li><strong>Prénom :</strong> ${prenom || '-'}</li>
      <li><strong>Nom :</strong> ${nom || '-'}</li>
      <li><strong>Email :</strong> ${email || '-'}</li>
      <li><strong>Téléphone :</strong> ${telephone || '-'}</li>
    </ul>

    <h3>Profil</h3>
    <ul>
      <li><strong>Statut :</strong> ${statut || '-'}</li>
      <li><strong>Année de naissance :</strong> ${annee_naissance || '-'}</li>
      <li><strong>Situation familiale :</strong> ${situation_familiale || '-'}</li>
      <li><strong>Département :</strong> ${departement || '-'}</li>
      <li><strong>Revenus annuels :</strong> ${revenus || '-'}</li>
      <li><strong>Contrats en cours :</strong> ${contrats_en_cours || '-'}</li>
    </ul>

    <h3>Thématiques & Besoins</h3>
    <ul>
      <li><strong>Thématiques sélectionnées :</strong> ${thematic_choices || '-'}</li>
      <li><strong>Autres thématiques :</strong> ${autres_themas || '-'}</li>
    </ul>

    <h3>Situation et Contexte</h3>
    <ul>
      <li><strong>Bilan précédent :</strong> ${bilan_precedent || '-'}</li>
      <li><strong>Horizon :</strong> ${horizon || '-'}</li>
      <li><strong>Budget mensuel estimatif :</strong> ${budget || '-'}</li>
    </ul>

    <h3>Situation particulière</h3>
    <p>${situation_particuliere ? situation_particuliere.replace(/\n/g, '<br/>') : '<em>Aucune</em>'}</p>
  `;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': brevoApiKey
            },
            body: JSON.stringify({
                sender: {
                    // Remplacer par l'email expéditeur validé sur  Brevo
                    email: 'baptiste.basset2@gmail.com',
                    name: 'Camille Fontaine'
                },
                to: [
                    {
                        // Remplacer par l'email de réception de l'agence (Camille ou Baptiste)
                        email: 'baptiste.basset2@gmail.com', // Remplacer par votre email de réception
                        name: 'Notif Brevo'
                    }
                ],
                subject: `Nouveau bilan : ${prenom} ${nom} - ${statut}`,
                htmlContent: htmlContent,
                replyTo: {
                    email: email,
                    name: `${prenom} ${nom}`
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur Brevo API:', errorData);
            return res.status(500).json({ error: 'Failed to send email via Brevo' });
        }

        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Erreur lors de la requête Brevo:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
