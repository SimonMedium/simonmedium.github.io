(function () {
  const container = document.getElementById("service-months");
  if (!container || !Array.isArray(window.diary)) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const allEvents = window.diary
    .filter((event) => event.status !== "cancelled")
    .map((event) => ({
      ...event,
      parsedDate: new Date(`${event.date}T12:00:00`)
    }))
    .sort((a, b) => a.parsedDate - b.parsedDate);

  const futureEvents = allEvents.filter((event) => event.parsedDate >= today);

  const serviceMonthKeys = [];
  futureEvents.forEach((event) => {
    if (event.kind === "message") return;
    const key = monthKey(event.parsedDate);
    if (!serviceMonthKeys.includes(key)) serviceMonthKeys.push(key);
  });

  let visibleMonthKeys = serviceMonthKeys.slice(0, 3);

  const currentMonthKey = monthKey(today);
  const hasFutureMessageThisMonth = futureEvents.some(
    (event) => event.kind === "message" && monthKey(event.parsedDate) === currentMonthKey
  );

  if (hasFutureMessageThisMonth && !visibleMonthKeys.includes(currentMonthKey)) {
    visibleMonthKeys = [currentMonthKey, ...visibleMonthKeys].slice(0, 3);
  }

  const events = futureEvents.filter((event) =>
    visibleMonthKeys.includes(monthKey(event.parsedDate))
  );

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
    if (["Halloween Special", "Christmas", "New Year"].includes(type)) return "service-special";
    return "service-standard";
  };

  const groupedMonths = events.reduce((groups, event) => {
    const key = monthKey(event.parsedDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
    return groups;
  }, {});

  const months = visibleMonthKeys
    .filter((key) => groupedMonths[key])
    .map((key) => groupedMonths[key]);

  const tabs = months
    .map((monthEvents, index) => {
      const monthDate = monthEvents[0].parsedDate;
      const monthLabel = monthDate.toLocaleDateString("en-GB", {
        month: "long"
      });

      return `
        <button
          class="month-tab${index === 0 ? " active" : ""}"
          id="month-tab-${index}"
          type="button"
          role="tab"
          aria-selected="${index === 0}"
          aria-controls="month-panel-${index}"
          tabindex="${index === 0 ? "0" : "-1"}"
        >
          ${escapeHtml(monthLabel)}
        </button>
      `;
    })
    .join("");

  const panels = months
    .map((monthEvents, index) => {
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
          const details = event.message
            ? escapeHtml(event.message)
            : [event.location, event.time ? `Starts at ${event.time}` : ""]
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
        <section
          class="service-month-panel"
          id="month-panel-${index}"
          role="tabpanel"
          aria-labelledby="month-tab-${index}"
          ${index === 0 ? "" : "hidden"}
        >
          <h3 class="selected-month-title">${escapeHtml(monthName)}</h3>
          <div class="service-list">${cards}</div>
        </section>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="month-tabs" role="tablist" aria-label="Choose a month">
      ${tabs}
    </div>
    <div class="month-panels">
      ${panels}
    </div>
  `;

  const tabButtons = Array.from(container.querySelectorAll(".month-tab"));
  const monthPanels = Array.from(
    container.querySelectorAll(".service-month-panel")
  );

  const selectMonth = (selectedIndex) => {
    tabButtons.forEach((button, index) => {
      const selected = index === selectedIndex;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      monthPanels[index].hidden = !selected;
    });
  };

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectMonth(index));

    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (index + direction + tabButtons.length) % tabButtons.length;
      selectMonth(nextIndex);
      tabButtons[nextIndex].focus();
    });
  });
})();
