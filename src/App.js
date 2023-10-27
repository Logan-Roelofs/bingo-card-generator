import React, { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

function BingoForm() {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState(["", "", "", "", ""]);
  const [categoryWords, setCategoryWords] = useState(["", "", "", "", ""]);
  const [numberOfCards, setNumberOfCards] = useState(1);

  const handleCategoryChange = (index, event) => {
    const newCategories = [...categories];
    newCategories[index] = event.target.value;
    setCategories(newCategories);
  };

  const handleWordsChange = (index, event) => {
    const newCategoryWords = [...categoryWords];
    newCategoryWords[index] = event.target.value;
    setCategoryWords(newCategoryWords);
  };

  const submitForm = (event) => {
    event.preventDefault();

    // Create the words object from the categories and categoryWords states
    let words = {};
    for (let i = 0; i < categories.length; i++) {
      words[categories[i]] = categoryWords[i].split(",");
    }

    // Validate if each category has at least 5 words
    for (let category of categories) {
      if (!words[category] || words[category].length < 5) {
        alert("Each category must have at least 5 words/phrases.");
        return;
      }
    }

    // Generate bingo cards
    let bingoCards = generateBingoCards(categories, words, numberOfCards);
    generatePDF(bingoCards, categories, title);
  };

  function generateBingoCards(categories, words, numberOfCards) {
    let bingoCards = [];

    // For each card
    for (let i = 0; i < numberOfCards; i++) {
      let card = {};
      let usedWords = {}; // Track used words for each category

      // For each category
      for (let category of categories) {
        // Skip this category if no words were provided for it
        if (!words[category]) {
          continue;
        }

        card[category] = [];
        usedWords[category] = new Set(); // Initialize set for this category

        // Randomly select words for the category
        for (let j = 0; j < 5; j++) {
          let randomWord;
          do {
            randomWord =
              words[category][
                Math.floor(Math.random() * words[category].length)
              ];
          } while (usedWords[category].has(randomWord));

          usedWords[category].add(randomWord);
          card[category].push(randomWord);
        }
      }

      bingoCards.push(card);
    }

    return bingoCards;
  }

  return (
    <form
      onSubmit={submitForm}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Bingo Card Generator</h1> {/* Add a title */}
      <p>The words input is separated by commas "," for example...</p>
      <p>State ,Hour ,Globes ,Crown ,Eagle ,Sunset</p>
      <label>
        Title:
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>
      {categories.map((category, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <label>
            Category {index + 1}:
            <input
              type="text"
              value={category}
              onChange={(event) => handleCategoryChange(index, event)}
              required
            />
          </label>
          <label>
            Words/Phrases:
            <input
              type="text"
              value={categoryWords[index]}
              onChange={(event) => handleWordsChange(index, event)}
              required
            />
          </label>
        </div>
      ))}
      <label>
        Number of Cards:
        <input
          type="number"
          value={numberOfCards}
          onChange={(event) => setNumberOfCards(event.target.value)}
          min="1"
          required
        />
      </label>
      <button type="submit">Generate Bingo Cards</button>
    </form>
  );
}

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function generatePDF(bingoCards, categories, title) {
  let docDefinition = {
    content: [],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      tableHeader: {
        // new style for the table header
        bold: true,
        fontSize: 16,
        alignment: "center",
        color: "black",
        fillColor: "#dddddd", // change this to your preferred highlight color
      },
    },
  };

  for (let card of bingoCards) {
    // Add a page break if this isn't the first card
    if (docDefinition.content.length > 0) {
      docDefinition.content.push({ text: "", pageBreak: "before" });
    }

    // Add title for this card
    docDefinition.content.push({
      text: title,
      style: "header",
      alignment: "center",
    });

    // Add content for this card
    let tableHeader = categories.map((category) => ({
      text: category,
      margin: [0, 50, 0, 50],
      style: "tableHeader",
    }));
    let tableBody = [tableHeader, [], [], [], [], []];
    for (let category in card) {
      for (let i = 0; i < card[category].length; i++) {
        tableBody[i + 1].push({
          stack: [
            {
              text: card[category][i] || "",
              alignment: "center", // Center text horizontally
              margin: [0, 10, 0, 10], // Adjust these values to center text vertically
            },
            {
              text: "\n", // Empty text box
              fontSize: 30, // Adjust this to change the minimum cell height
              bold: true,
            },
          ],
        });
      }
    }

    // Only add the table to the content if it has at least one row
    if (tableBody.length > 0) {
      docDefinition.content.push({
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: tableBody,
        },
      });
    }
  }

  pdfMake.createPdf(docDefinition).download();
}

export default BingoForm;
