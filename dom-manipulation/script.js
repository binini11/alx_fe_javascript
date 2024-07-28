let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only way to do great work is to love what you do. - Steve Jobs", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity. - Albert Einstein", category: "Inspiration" }
];


function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}


function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = filteredQuotes[randomIndex].text;
  sessionStorage.setItem('lastQuote', filteredQuotes[randomIndex].text);
}


function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
    syncWithServer();
  } else {
    alert('Please enter both quote text and category.');
  }
}


function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}


function exportQuotes() {
  const dataStr = JSON.stringify(quotes);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}


function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}


function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}


function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}


function filterQuotes() {
  const filteredQuotes = getFilteredQuotes();
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (filteredQuotes.length > 0) {
    quoteDisplay.innerHTML = filteredQuotes[0].text;
  } else {
    quoteDisplay.innerHTML = 'No quotes available for this category.';
  }
  localStorage.setItem('selectedCategory', document.getElementById('categoryFilter').value);
}


async function syncWithServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    const serverQuotesFormatted = serverQuotes.map(post => ({
      text: post.title,
      category: 'Server'
    }));
    quotes = [...new Set([...serverQuotesFormatted, ...quotes])];
    saveQuotes();
    populateCategories();
    showNotification('Quotes synced with server.');
  } catch (error) {
    console.error('Error syncing with server:', error);
  }
}


function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  setTimeout(() => {
    notification.textContent = '';
  }, 3000);
}


document.getElementById('newQuote').addEventListener('click', showRandomQuote);


document.getElementById('exportQuotes').addEventListener('click', exportQuotes);


createAddQuoteForm();


populateCategories();


window.onload = function() {
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    document.getElementById('quoteDisplay').innerHTML = lastQuote;
  }
  const selectedCategory = localStorage.getItem('selectedCategory');
  if (selectedCategory) {
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes();
  }
  syncWithServer();
};

setInterval(syncWithServer, 60000); 
