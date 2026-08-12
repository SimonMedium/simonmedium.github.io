(function () {
  const cards = Array.from(
    document.querySelectorAll(".circle-details-grid .circle-detail-card")
  );
  if (!cards.length) return;

  const compactView = window.matchMedia("(max-width: 900px)");

  const setLayout = () => {
    if (compactView.matches) {
      cards.forEach((card, index) => {
        card.open = index === 0;
      });
    } else {
      cards.forEach((card) => {
        card.open = true;
      });
    }
  };

  cards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (!compactView.matches || !card.open) return;

      cards.forEach((otherCard) => {
        if (otherCard !== card) otherCard.open = false;
      });
    });
  });

  setLayout();
  compactView.addEventListener("change", setLayout);
})();
