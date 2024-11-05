
(async () => {
    if (!('translation' in self) || !('createDetector' in self.translation)) {
      document.querySelector('.not-supported-message').hidden = false;
      return;
    }
  
    const input = document.getElementById("input")
    const output = document.getElementById("output")

    const detector = await self.translation.createDetector();
    input.addEventListener('input', async () => {
        if (!input.value.trim()) {
          detected.textContent = 'not sure what language this is';
          return;
        }
        const { detectedLanguage, confidence } = (
          await detector.detect(input.value.trim())
        )[0];
        output.textContent = `${(confidence * 100).toFixed(
          1
        )}% sure that this is ${languageTagToHumanReadable(
          detectedLanguage,
          'en'
        )}`;
      });
  })();