function scrapeHandshake() {
  // 1. Get Job Title
  // Handshake usually puts the main job title in the only <H1> on the right pane
  const title = document.querySelector("h1")?.innerText || "Title Not Found";

  // 2. Get Company Name
  // We look for the link that points to the employer profile.
  // It usually has a specific class structure, but the aria-label is safer.
  // We look for the "lockup-subheading" data hook, then look at the sibling/parent.
  let company = "Company Not Found";
  const employerLogo = document.querySelector(
    'a[aria-label^="Follow this employer"]'
  );
  if (employerLogo) {
    // The aria label usually says "Follow this employer: [Company Name]"
    company = employerLogo
      .getAttribute("aria-label")
      .replace("Follow this employer: ", "");
  } else {
    // Backup: Look for the text inside the header link
    const headerLink = document.querySelector(
      'a[data-size="xlarge"][href^="/e/"]'
    );
    if (headerLink) company = headerLink.innerText;
  }

  // 3. Get Job Description
  // Handshake wraps the description in a div with specific inline styles for wrapping.
  // This is a very unique selector that rarely changes.
  const descriptionContainer = document.querySelector(
    'div[style*="overflow-wrap: break-word"]'
  );

  // If we can't find that, we look for the section following "About the Role"
  let description = "";
  if (descriptionContainer) {
    description = descriptionContainer.innerText;
  } else {
    // Fallback: Grab the main text container
    const allTextContainers = document.querySelectorAll("div");
    for (const div of allTextContainers) {
      if (div.innerText.includes("About the Role")) {
        description = div.innerText;
        break;
      }
    }
  }

  // 4. Get Metadata (Location/Salary)
  // These are usually in the "At a glance" section
  const metadata = [];
  const glanceHeaders = Array.from(document.querySelectorAll("h3")).find(
    (h) => h.innerText === "At a glance"
  );
  if (glanceHeaders) {
    const container = glanceHeaders.parentElement.parentElement;
    metadata.push(container.innerText.replace("At a glance", "").trim());
  }

  return {
    jobTitle: title,
    company: company,
    metadata: metadata.join("\n"),
    description: description,
  };
}

// Run it
console.log(scrapeHandshake());
