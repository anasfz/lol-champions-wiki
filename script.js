/**
 * Project: League of Legends Champions Explorer
 * Description: Handles fetching champion data, rendering the UI, filtering, and modal interactions.
 */

// ==========================================
// DOM Elements Selection
// ==========================================
const championsGrid = document.getElementById("championsGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

// Modal DOM Elements
const modal = document.getElementById("championModal");
const closeModalBtn = document.getElementById("closeModal");
const modalSplash = document.getElementById("modalSplash");
const modalName = document.getElementById("modalName");
const modalTitle = document.getElementById("modalTitle");
const modalTags = document.getElementById("modalTags");
const modalBlurb = document.getElementById("modalBlurb");

// Global state to store all champions data
let allChampions = [];

// ==========================================
// Data Fetching & Rendering
// ==========================================

/**
 * Fetches champion data from the Data Dragon API and initializes the grid.
 */
async function fetchChampions() {
    try {
        const response = await fetch("https://ddragon.leagueoflegends.com/cdn/14.3.1/data/en_US/champion.json");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Convert the champions object into an array for easier filtering/mapping
        allChampions = Object.values(jsonData.data);
        
        // Render all champions initially
        renderChampions(allChampions);
    } catch (error) {
        console.error("Failed to fetch champions:", error);
        championsGrid.innerHTML = '<p class="error">Sorry, we were unable to load the champions. Please try again later.</p>';
    }
}

/**
 * Renders an array of champion objects to the DOM.
 * @param {Array} championsArray - Array of champion objects to display.
 */
function renderChampions(championsArray) {
    // Handle empty state
    if (championsArray.length === 0) {
        championsGrid.innerHTML = '<p class="no-results">There is no champion matching your search criteria.</p>';
        return;
    }

    // Generate HTML for each champion card
    const htmlString = championsArray.map((champ) => {
        const { id, name, tags } = champ;
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${id}.png`;

        return `
            <div class="champion-card" data-id="${id}">
                <img class="champion-icon" src="${imageUrl}" alt="${name}">
                <div class="champion-info">
                    <h3 class="champion-name">${name}</h3>
                    <span class="champion-role">${tags.join(', ')}</span>
                </div>
            </div>
        `;
    }).join("");

    // Update the DOM
    championsGrid.innerHTML = htmlString;
}

// Initialize the app by fetching data
fetchChampions();

// ==========================================
// Event Listeners: Search & Filtering
// ==========================================

// Handle search input
searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Filter champions by name based on search term
    const filteredChampions = allChampions.filter((champ) => {
         return champ.name.toLowerCase().includes(searchTerm);
    });
    
    renderChampions(filteredChampions);
});

// Handle role filter buttons
filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        // Remove 'active' class from all buttons, then add to the clicked one
        filterButtons.forEach(btn => btn.classList.remove("active"));
        event.target.classList.add("active");

        const selectedRole = event.target.getAttribute("data-role").toLowerCase();

        // Filter data based on the selected role
        if (selectedRole === "all") {
            renderChampions(allChampions);
        } else {
            const filteredChampions = allChampions.filter((champ) => {
                // Check if the champion has the selected role in their tags
                return champ.tags.some(tag => tag.toLowerCase() === selectedRole);
            });
            renderChampions(filteredChampions);
        }
    });
});

// ==========================================
// Event Listeners: Modal Interactions
// ==========================================

// Open modal and display champion details when a card is clicked
championsGrid.addEventListener("click", (event) => {
    // Find the closest champion card element
    const card = event.target.closest(".champion-card");
    if (!card) return; // Exit if the click was outside a card

    const championId = card.getAttribute("data-id");
    const champion = allChampions.find(champ => champ.id === championId);
    
    // Populate modal data
    if (champion) {
        modalSplash.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;
        modalName.textContent = champion.name;
        modalTitle.textContent = champion.title;
        modalTags.textContent = champion.tags.join(" - ");
        modalBlurb.textContent = champion.blurb; 
        
        // Show modal
        modal.classList.remove("hidden");
    }
});

// Close modal when the 'X' button is clicked
closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.add("hidden");
    }
});