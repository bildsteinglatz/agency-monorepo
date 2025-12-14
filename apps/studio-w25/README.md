# Sanity Schema Project

This project is designed to manage various aspects of the art world, including artists, their artworks, exhibitions, texts, documentation photos, and social media posts. It utilizes Sanity as a headless CMS to provide a flexible and powerful content management solution.

## Project Structure

The project consists of the following files:

- **schemas/**
  - **artist.ts**: Defines the schema for an artist, including properties such as name, biography, dateOfBirth, and an array of artworks.
  - **artwork.ts**: Defines the schema for an artwork, including properties such as title, medium, year, dimensions, and a reference to the artist.
  - **exhibition.ts**: Defines the schema for an exhibition, including properties such as title, date, location, and an array of artworks.
  - **text.ts**: Defines the schema for texts related to artists or artworks, including properties such as title, content, and a reference to the artist or artwork.
  - **documentationPhoto.ts**: Defines the schema for documentation photos, including properties such as image, description, and a reference to the artist or exhibition.
  - **socialMediaPost.ts**: Defines the schema for social media posts, including properties such as content, date, platform, and a reference to the artist.
  - **index.ts**: Imports all individual schemas and exports them as a single object for easier access.

- **sanity.config.ts**: The configuration file for Sanity, setting up the project and schemas for the Sanity studio.

## Setup Instructions

1. **Clone the Repository**: 
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Install Dependencies**: 
   Navigate to the project directory and install the necessary dependencies:
   ```
   cd sanity-schema-project
   npm install
   ```

3. **Run the Sanity Studio**: 
   Start the Sanity studio to manage your content:
   ```
   sanity start
   ```

4. **Access the Studio**: 
   Open your browser and go to `http://localhost:3333` to access the Sanity studio.

## Usage Guidelines

- Use the schemas defined in the `schemas` directory to create and manage content related to artists, artworks, exhibitions, and more.
- Follow the structure and properties outlined in each schema to ensure consistency and integrity of the data.
- Refer to the Sanity documentation for advanced configurations and features.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.