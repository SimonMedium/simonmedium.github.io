(function () {
  const container = document.getElementById("service-months");
  if (!container || !Array.isArray(window.diary)) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = window.diary
    .filter((event) => event.status !== "cancelled")
    .map((event) => ({
      ...event,
      parsedDate: new Date(`${event.date}T12:00:00`)
    }))
    .filter((event) => event.parsedDate >= today)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  if (!events.length) {
    container.innerHTML =
      '<p class="no-services">There are no upcoming dates listed at the moment.</p>';
    return;
  }

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[character]
    );

  const typeClass = (type) => {
    if (type === "Open Circle") return "service-circle";
    if (type === "Night of Mediumship") return "service-mediumship";
    if (type === "Divine Service") return "service-divine";
    if (type === "Halloween Special") return "service-special";
    return "service-standard";
  };

  const months = events.reduce((groups, event) => {
    const key = `${event.parsedDate.getFullYear()}-${event.parsedDate.getMonth()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
    return groups;
  }, {});

  container.innerHTML = Object.values(months)
    .map((monthEvents) => {
      const monthDate = monthEvents[0].parsedDate;
      const monthName = monthDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
      });

      const cards = monthEvents
        .map((event) => {
          const weekday = event.parsedDate.toLocaleDateString("en-GB", {
            weekday: "long"
          });
          const shortDate = event.parsedDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
          });
          const details = [
            event.location,
            `Starts at ${event.time}`
          ]
            .filter(Boolean)
            .map(escapeHtml)
            .join(" · ");

          return `
            <article class="service-card">
              <div class="service-date">
                <span>${escapeHtml(weekday)}</span>
                <strong>${escapeHtml(shortDate)}</strong>
              </div>
              <div class="service-details">
                <h4>${escapeHtml(event.venue)}</h4>
                <p>${details}</p>
              </div>
              <div class="service-type ${typeClass(event.type)}">
                ${escapeHtml(event.type)}
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <section class="service-month" aria-labelledby="month-${monthDate.getFullYear()}-${monthDate.getMonth()}">
          <div class="service-month-heading">
            <span aria-hidden="true"></span>
            <h3 id="month-${monthDate.getFullYear()}-${monthDate.getMonth()}">${escapeHtml(monthName)}</h3>
            <span aria-hidden="true"></span>
          </div>
          <div class="service-list">${cards}</div>
        </section>
      `;
    })
    .join("");
})();
