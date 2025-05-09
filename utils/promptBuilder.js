export function buildPrompt(text, type = "default", metadata = {}) {

    // Define variables
    let systemPrompt = ""
    let startSequence = ""

    switch (type) {
        case "abstraction":
            systemPrompt = "### Instruction:\nJe taak is om een klinische abstractie te maken van de onderstaande rapportage. Let op: je mag intern redeneren, maar in je output mag alleen de uiteindelijke abstractie verschijnen — géén tussenstappen, géén uitleg, géén interne gedachten.\n\nVolg deze richtlijnen bij het maken van de abstractie:\n\n1. Voeg geen nieuwe informatie toe en trek geen conclusies die niet letterlijk in de rapportage staan.\n2. Behoud alle belangrijke elementen, zoals:\n   - observaties\n   - benoemde emoties\n   - klachten (fysiek of mentaal)\n   - reacties op omgeving of begeleiding\n   - uitgesproken voorkeuren of behoeftes\n3. Noem alle uitgevoerde acties en gemaakte afspraken expliciet.\n4. Neem oorzaak-gevolgrelaties op zoals die in de tekst benoemd worden.\n5. Zorg voor correct en verzorgd Nederlands in de abstractie.\n6. Sluit je output af met exact de volgende woorden: <|END_ABSTRACTIE|>\n\n### Input:"
            startSequence = "\n\n### Output:\n<|ABSTRACTIE_START|>\n"
            console.log(systemPrompt + text + startSequence);
            return systemPrompt + text + startSequence;

        case "summarization":
            systemPrompt = "### Instruction:\nJe taak is om een klinische abstractie te maken van de onderstaande rapportage. Let op: je mag intern redeneren, maar in je output mag alleen de uiteindelijke abstractie verschijnen — géén tussenstappen, géén uitleg, géén interne gedachten.\n\nVolg deze richtlijnen bij het maken van de abstractie:\n\n1. Voeg geen nieuwe informatie toe en trek geen conclusies die niet letterlijk in de rapportage staan.\n2. Behoud alle belangrijke elementen, zoals:\n   - observaties\n   - benoemde emoties\n   - klachten (fysiek of mentaal)\n   - reacties op omgeving of begeleiding\n   - uitgesproken voorkeuren of behoeftes\n3. Noem alle uitgevoerde acties en gemaakte afspraken expliciet.\n4. Neem oorzaak-gevolgrelaties op zoals die in de tekst benoemd worden.\n5. Zorg voor correct en verzorgd Nederlands in de abstractie.\n6. Sluit je output af met exact de volgende woorden: <|END_ABSTRACTIE|>\n\n### Input:"
            stopSequence = "\n\n### Output:\n<|ABSTRACTIE_START|>\n"
            console.log(systemPrompt + text + startSequence);
            return systemPrompt + text + startSequence;

        case "translation":
            return `### INSTRUCTIE\nVertaal deze Nederlandse medische tekst naar het Engels:\n\n${text}\n\n### Vertaling:\n`;

        case "customWithMetadata":
            const { context = "", keywords = [] } = metadata;
            return `### INSTRUCTIE\nGebruik de volgende context: ${context}\nZoekwoorden: ${keywords.join(', ')}\n\nTekst:\n${text}\n\n### Output:\n`;

        default:
            return `### INSTRUCTIE\nBehandel deze tekst volgens een standaardprocedure:\n\n${text}\n\n### Reactie:\n`;
    }
}
