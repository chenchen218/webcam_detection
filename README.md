# Face Recognition Web App

A React-based web application that uses face-api.js for real-time face detection, recognition, and analysis.

## Features

- Real-time face detection using webcam
- Face recognition against known faces
- Age and gender estimation
- Emotion detection
- Redux state management
- TypeScript support

## Setup

1. Clone the repository:

```bash
git clone [your-repo-url]
cd my-face-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Add face recognition images:

   - Create a directory: `public/images/`
   - Add person images in format: `public/images/[name]/[name].jpg`
   - Example: `public/images/john/john.jpg`

4. Start the development server:

```bash
npm start
# or
yarn start
```

## Technologies Used

- React
- TypeScript
- Redux Toolkit
- face-api.js
- TensorFlow.js

## Project Structure

```
src/
  ├── components/     # React components
  ├── features/       # Redux slices
  ├── store/         # Redux store configuration
  ├── types/         # TypeScript type definitions
  └── App.tsx        # Main application component
```

## License

MIT
