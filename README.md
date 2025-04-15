# Bookify - AI Book Generator

Bookify is a web application that uses Google's Gemini AI to generate complete books based on user input. Users can specify a topic, genre, and number of chapters, and the application will generate a detailed book outline with chapter summaries. Users can then generate full content for each chapter.

## Features

- Generate book outlines with customizable topics, genres, and chapter counts
- Create detailed chapter content based on the outline
- Clean, responsive user interface
- Markdown rendering for chapter content

## Technologies Used

- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS for styling
- Google Gemini AI API for content generation
- React Hook Form for form handling
- Zod for validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- A Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/bookify.git
cd bookify
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Gemini API key:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

4. Start the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter a book topic, select a genre, and specify the number of chapters
2. Click "Generate Book Outline" to create a book outline
3. Review the generated outline with chapter summaries
4. Click "Generate Content" for any chapter to create detailed chapter content
5. Use "Create New Book" to start over

## Customization

- Modify the prompts in `src/utils/gemini.ts` to change how the AI generates content
- Add more genres in the `genreOptions` array in `src/components/book-generator-form.tsx`
- Customize the UI by editing the components in the `src/components` directory

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for providing the generative AI capabilities
- Next.js team for the excellent React framework
# trybookai-v2
