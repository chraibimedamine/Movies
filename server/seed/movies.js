import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'neo4j://127.0.0.1:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'moviesmovies'
    )
);

const movies = [
    // Christopher Nolan Films
    {
        id: 'movie-1',
        title: 'The Dark Knight',
        plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        releaseYear: 2008,
        runtime: 152,
        rating: 9.0,
        poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
        director: 'Christopher Nolan',
        genres: ['Action', 'Crime', 'Drama'],
        cast: [
            { name: 'Christian Bale', character: 'Bruce Wayne / Batman' },
            { name: 'Heath Ledger', character: 'Joker' },
            { name: 'Aaron Eckhart', character: 'Harvey Dent' },
            { name: 'Michael Caine', character: 'Alfred' },
            { name: 'Gary Oldman', character: 'Commissioner Gordon' }
        ]
    },
    {
        id: 'movie-2',
        title: 'Inception',
        plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
        releaseYear: 2010,
        runtime: 148,
        rating: 8.8,
        poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGcHtcVxoJSKQDr.jpg',
        director: 'Christopher Nolan',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        cast: [
            { name: 'Leonardo DiCaprio', character: 'Dom Cobb' },
            { name: 'Joseph Gordon-Levitt', character: 'Arthur' },
            { name: 'Elliot Page', character: 'Ariadne' },
            { name: 'Tom Hardy', character: 'Eames' },
            { name: 'Marion Cotillard', character: 'Mal' }
        ]
    },
    {
        id: 'movie-3',
        title: 'Interstellar',
        plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        releaseYear: 2014,
        runtime: 169,
        rating: 8.7,
        poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
        director: 'Christopher Nolan',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        cast: [
            { name: 'Matthew McConaughey', character: 'Cooper' },
            { name: 'Anne Hathaway', character: 'Dr. Amelia Brand' },
            { name: 'Jessica Chastain', character: 'Murph' },
            { name: 'Michael Caine', character: 'Professor Brand' },
            { name: 'Matt Damon', character: 'Dr. Mann' }
        ]
    },
    {
        id: 'movie-4',
        title: 'Oppenheimer',
        plot: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        releaseYear: 2023,
        runtime: 180,
        rating: 8.5,
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg',
        director: 'Christopher Nolan',
        genres: ['Biography', 'Drama', 'History'],
        cast: [
            { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
            { name: 'Emily Blunt', character: 'Kitty Oppenheimer' },
            { name: 'Matt Damon', character: 'Leslie Groves' },
            { name: 'Robert Downey Jr.', character: 'Lewis Strauss' },
            { name: 'Florence Pugh', character: 'Jean Tatlock' }
        ]
    },
    // Quentin Tarantino Films
    {
        id: 'movie-5',
        title: 'Pulp Fiction',
        plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        releaseYear: 1994,
        runtime: 154,
        rating: 8.9,
        poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
        director: 'Quentin Tarantino',
        genres: ['Crime', 'Drama'],
        cast: [
            { name: 'John Travolta', character: 'Vincent Vega' },
            { name: 'Uma Thurman', character: 'Mia Wallace' },
            { name: 'Samuel L. Jackson', character: 'Jules Winnfield' },
            { name: 'Bruce Willis', character: 'Butch Coolidge' },
            { name: 'Harvey Keitel', character: 'The Wolf' }
        ]
    },
    {
        id: 'movie-6',
        title: 'Kill Bill: Volume 1',
        plot: 'After awakening from a four-year coma, a former assassin wreaks vengeance on the team of assassins who betrayed her.',
        releaseYear: 2003,
        runtime: 111,
        rating: 8.2,
        poster: 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/dH18WkgfMFR2ItqKNqz0YZIR4kM.jpg',
        director: 'Quentin Tarantino',
        genres: ['Action', 'Crime', 'Thriller'],
        cast: [
            { name: 'Uma Thurman', character: 'The Bride' },
            { name: 'Lucy Liu', character: 'O-Ren Ishii' },
            { name: 'Vivica A. Fox', character: 'Vernita Green' },
            { name: 'David Carradine', character: 'Bill' }
        ]
    },
    {
        id: 'movie-7',
        title: 'Django Unchained',
        plot: 'With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal plantation owner in Mississippi.',
        releaseYear: 2012,
        runtime: 165,
        rating: 8.5,
        poster: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/2oZklIzUbvZXXzIFzv7Hi68d6xf.jpg',
        director: 'Quentin Tarantino',
        genres: ['Drama', 'Western'],
        cast: [
            { name: 'Jamie Foxx', character: 'Django' },
            { name: 'Christoph Waltz', character: 'Dr. King Schultz' },
            { name: 'Leonardo DiCaprio', character: 'Calvin Candie' },
            { name: 'Kerry Washington', character: 'Broomhilda' },
            { name: 'Samuel L. Jackson', character: 'Stephen' }
        ]
    },
    // Marvel/Superhero Films
    {
        id: 'movie-8',
        title: 'Avengers: Endgame',
        plot: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos actions and restore balance.',
        releaseYear: 2019,
        runtime: 181,
        rating: 8.4,
        poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        director: 'Anthony Russo',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        cast: [
            { name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man' },
            { name: 'Chris Evans', character: 'Steve Rogers / Captain America' },
            { name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow' },
            { name: 'Chris Hemsworth', character: 'Thor' },
            { name: 'Mark Ruffalo', character: 'Bruce Banner / Hulk' }
        ]
    },
    {
        id: 'movie-9',
        title: 'Spider-Man: Across the Spider-Verse',
        plot: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        releaseYear: 2023,
        runtime: 140,
        rating: 8.7,
        poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        director: 'Joaquim Dos Santos',
        genres: ['Animation', 'Action', 'Adventure'],
        cast: [
            { name: 'Shameik Moore', character: 'Miles Morales' },
            { name: 'Hailee Steinfeld', character: 'Gwen Stacy' },
            { name: 'Oscar Isaac', character: 'Miguel O\'Hara' },
            { name: 'Jake Johnson', character: 'Peter B. Parker' }
        ]
    },
    {
        id: 'movie-10',
        title: 'The Batman',
        plot: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the citys hidden corruption and question his familys involvement.',
        releaseYear: 2022,
        runtime: 176,
        rating: 7.8,
        poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        director: 'Matt Reeves',
        genres: ['Action', 'Crime', 'Drama'],
        cast: [
            { name: 'Robert Pattinson', character: 'Bruce Wayne / Batman' },
            { name: 'Zoë Kravitz', character: 'Selina Kyle / Catwoman' },
            { name: 'Paul Dano', character: 'The Riddler' },
            { name: 'Colin Farrell', character: 'Oswald Cobblepot / Penguin' },
            { name: 'Jeffrey Wright', character: 'Lt. James Gordon' }
        ]
    },
    // Sci-Fi Classics
    {
        id: 'movie-11',
        title: 'The Matrix',
        plot: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.',
        releaseYear: 1999,
        runtime: 136,
        rating: 8.7,
        poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
        director: 'Lana Wachowski',
        genres: ['Action', 'Sci-Fi'],
        cast: [
            { name: 'Keanu Reeves', character: 'Neo' },
            { name: 'Laurence Fishburne', character: 'Morpheus' },
            { name: 'Carrie-Anne Moss', character: 'Trinity' },
            { name: 'Hugo Weaving', character: 'Agent Smith' }
        ]
    },
    {
        id: 'movie-12',
        title: 'Blade Runner 2049',
        plot: 'Young Blade Runner Ks discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, whos been missing for thirty years.',
        releaseYear: 2017,
        runtime: 164,
        rating: 8.0,
        poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg',
        director: 'Denis Villeneuve',
        genres: ['Drama', 'Mystery', 'Sci-Fi'],
        cast: [
            { name: 'Ryan Gosling', character: 'K' },
            { name: 'Harrison Ford', character: 'Rick Deckard' },
            { name: 'Ana de Armas', character: 'Joi' },
            { name: 'Jared Leto', character: 'Niander Wallace' }
        ]
    },
    {
        id: 'movie-13',
        title: 'Dune: Part Two',
        plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        releaseYear: 2024,
        runtime: 166,
        rating: 8.8,
        poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
        director: 'Denis Villeneuve',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        cast: [
            { name: 'Timothée Chalamet', character: 'Paul Atreides' },
            { name: 'Zendaya', character: 'Chani' },
            { name: 'Rebecca Ferguson', character: 'Lady Jessica' },
            { name: 'Austin Butler', character: 'Feyd-Rautha' },
            { name: 'Florence Pugh', character: 'Princess Irulan' }
        ]
    },
    {
        id: 'movie-14',
        title: 'Arrival',
        plot: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
        releaseYear: 2016,
        runtime: 116,
        rating: 7.9,
        poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/yIZ1xMqSMcsoBoFoDWg58f6VHXM.jpg',
        director: 'Denis Villeneuve',
        genres: ['Drama', 'Mystery', 'Sci-Fi'],
        cast: [
            { name: 'Amy Adams', character: 'Dr. Louise Banks' },
            { name: 'Jeremy Renner', character: 'Ian Donnelly' },
            { name: 'Forest Whitaker', character: 'Colonel Weber' }
        ]
    },
    // Drama Classics
    {
        id: 'movie-15',
        title: 'The Shawshank Redemption',
        plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseYear: 1994,
        runtime: 142,
        rating: 9.3,
        poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
        director: 'Frank Darabont',
        genres: ['Drama'],
        cast: [
            { name: 'Tim Robbins', character: 'Andy Dufresne' },
            { name: 'Morgan Freeman', character: 'Ellis Boyd Redding' },
            { name: 'Bob Gunton', character: 'Warden Norton' },
            { name: 'William Sadler', character: 'Heywood' }
        ]
    },
    {
        id: 'movie-16',
        title: 'The Godfather',
        plot: 'The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.',
        releaseYear: 1972,
        runtime: 175,
        rating: 9.2,
        poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        director: 'Francis Ford Coppola',
        genres: ['Crime', 'Drama'],
        cast: [
            { name: 'Marlon Brando', character: 'Don Vito Corleone' },
            { name: 'Al Pacino', character: 'Michael Corleone' },
            { name: 'James Caan', character: 'Sonny Corleone' },
            { name: 'Robert Duvall', character: 'Tom Hagen' }
        ]
    },
    {
        id: 'movie-17',
        title: 'Fight Club',
        plot: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
        releaseYear: 1999,
        runtime: 139,
        rating: 8.8,
        poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg',
        director: 'David Fincher',
        genres: ['Drama'],
        cast: [
            { name: 'Brad Pitt', character: 'Tyler Durden' },
            { name: 'Edward Norton', character: 'The Narrator' },
            { name: 'Helena Bonham Carter', character: 'Marla Singer' }
        ]
    },
    {
        id: 'movie-18',
        title: 'Goodfellas',
        plot: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
        releaseYear: 1990,
        runtime: 145,
        rating: 8.7,
        poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/sw7mordbZxgITU877yTpZCud90M.jpg',
        director: 'Martin Scorsese',
        genres: ['Biography', 'Crime', 'Drama'],
        cast: [
            { name: 'Robert De Niro', character: 'James Conway' },
            { name: 'Ray Liotta', character: 'Henry Hill' },
            { name: 'Joe Pesci', character: 'Tommy DeVito' },
            { name: 'Lorraine Bracco', character: 'Karen Hill' }
        ]
    },
    // Oscar Winners
    {
        id: 'movie-19',
        title: 'Parasite',
        plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        releaseYear: 2019,
        runtime: 132,
        rating: 8.6,
        poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
        director: 'Bong Joon-ho',
        genres: ['Comedy', 'Drama', 'Thriller'],
        cast: [
            { name: 'Song Kang-ho', character: 'Ki-taek' },
            { name: 'Lee Sun-kyun', character: 'Dong-ik' },
            { name: 'Cho Yeo-jeong', character: 'Yeon-gyo' },
            { name: 'Choi Woo-shik', character: 'Ki-woo' }
        ]
    },
    {
        id: 'movie-20',
        title: 'Everything Everywhere All at Once',
        plot: 'An aging Chinese immigrant is swept up in an insane adventure where she alone can save what is important to her by connecting with the lives she could have led in other universes.',
        releaseYear: 2022,
        runtime: 139,
        rating: 8.0,
        poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/fOy2Jurz9k6RnJnMUMRDAgBwru2.jpg',
        director: 'Daniel Kwan',
        genres: ['Action', 'Adventure', 'Comedy'],
        cast: [
            { name: 'Michelle Yeoh', character: 'Evelyn Wang' },
            { name: 'Stephanie Hsu', character: 'Joy Wang' },
            { name: 'Ke Huy Quan', character: 'Waymond Wang' },
            { name: 'Jamie Lee Curtis', character: 'Deirdre Beaubeirdre' }
        ]
    },
    // Horror/Thriller
    {
        id: 'movie-21',
        title: 'Get Out',
        plot: 'A young African-American visits his white girlfriends parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.',
        releaseYear: 2017,
        runtime: 104,
        rating: 7.7,
        poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfBfqoo54RZQ9K5.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/zaX30pHRs688MmfzGfwvwwMp7Mz.jpg',
        director: 'Jordan Peele',
        genres: ['Horror', 'Mystery', 'Thriller'],
        cast: [
            { name: 'Daniel Kaluuya', character: 'Chris Washington' },
            { name: 'Allison Williams', character: 'Rose Armitage' },
            { name: 'Bradley Whitford', character: 'Dean Armitage' },
            { name: 'Catherine Keener', character: 'Missy Armitage' }
        ]
    },
    {
        id: 'movie-22',
        title: 'The Silence of the Lambs',
        plot: 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
        releaseYear: 1991,
        runtime: 118,
        rating: 8.6,
        poster: 'https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg',
        director: 'Jonathan Demme',
        genres: ['Crime', 'Drama', 'Thriller'],
        cast: [
            { name: 'Jodie Foster', character: 'Clarice Starling' },
            { name: 'Anthony Hopkins', character: 'Dr. Hannibal Lecter' },
            { name: 'Scott Glenn', character: 'Jack Crawford' },
            { name: 'Ted Levine', character: 'Jame Gumb' }
        ]
    },
    // Recent Releases 2024-2025
    {
        id: 'movie-23',
        title: 'Deadpool & Wolverine',
        plot: 'Deadpool is offered a place in the Marvel Cinematic Universe by the TVA, but instead recruits a variant of Wolverine to save his universe from extinction.',
        releaseYear: 2024,
        runtime: 128,
        rating: 8.0,
        poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
        director: 'Shawn Levy',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        cast: [
            { name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool' },
            { name: 'Hugh Jackman', character: 'Logan / Wolverine' },
            { name: 'Emma Corrin', character: 'Cassandra Nova' },
            { name: 'Matthew Macfadyen', character: 'Mr. Paradox' }
        ]
    },
    {
        id: 'movie-24',
        title: 'Inside Out 2',
        plot: 'Follow Riley in her teenage years as new emotions join the mix in her mind.',
        releaseYear: 2024,
        runtime: 96,
        rating: 8.1,
        poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg',
        director: 'Kelsey Mann',
        genres: ['Animation', 'Adventure', 'Comedy'],
        cast: [
            { name: 'Amy Poehler', character: 'Joy' },
            { name: 'Maya Hawke', character: 'Anxiety' },
            { name: 'Phyllis Smith', character: 'Sadness' },
            { name: 'Lewis Black', character: 'Anger' }
        ]
    },
    {
        id: 'movie-25',
        title: 'Furiosa: A Mad Max Saga',
        plot: 'The origin story of renegade warrior Furiosa before her encounter with Mad Max.',
        releaseYear: 2024,
        runtime: 148,
        rating: 7.7,
        poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/fOy2Jurz9k6RnJnMUMRDAgBwru2.jpg',
        director: 'George Miller',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        cast: [
            { name: 'Anya Taylor-Joy', character: 'Furiosa' },
            { name: 'Chris Hemsworth', character: 'Dementus' },
            { name: 'Tom Burke', character: 'Praetorian Jack' }
        ]
    },
    // Classic Spielberg
    {
        id: 'movie-26',
        title: 'Jurassic Park',
        plot: 'A pragmatic paleontologist touring an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the parks cloned dinosaurs to run loose.',
        releaseYear: 1993,
        runtime: 127,
        rating: 8.2,
        poster: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/b3AiYJb4JJMwQu8jFRwmojoFOaj.jpg',
        director: 'Steven Spielberg',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        cast: [
            { name: 'Sam Neill', character: 'Dr. Alan Grant' },
            { name: 'Laura Dern', character: 'Dr. Ellie Sattler' },
            { name: 'Jeff Goldblum', character: 'Dr. Ian Malcolm' },
            { name: 'Richard Attenborough', character: 'John Hammond' }
        ]
    },
    {
        id: 'movie-27',
        title: 'Schindlers List',
        plot: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
        releaseYear: 1993,
        runtime: 195,
        rating: 9.0,
        poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
        director: 'Steven Spielberg',
        genres: ['Biography', 'Drama', 'History'],
        cast: [
            { name: 'Liam Neeson', character: 'Oskar Schindler' },
            { name: 'Ben Kingsley', character: 'Itzhak Stern' },
            { name: 'Ralph Fiennes', character: 'Amon Göth' }
        ]
    },
    {
        id: 'movie-28',
        title: 'Saving Private Ryan',
        plot: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        releaseYear: 1998,
        runtime: 169,
        rating: 8.6,
        poster: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/bdD39MpSVhKjxarTxLSfX6baoMP.jpg',
        director: 'Steven Spielberg',
        genres: ['Drama', 'War'],
        cast: [
            { name: 'Tom Hanks', character: 'Captain John Miller' },
            { name: 'Matt Damon', character: 'Private James Ryan' },
            { name: 'Tom Sizemore', character: 'Sergeant Horvath' },
            { name: 'Vin Diesel', character: 'Private Caparzo' }
        ]
    },
    // John Wick Franchise
    {
        id: 'movie-29',
        title: 'John Wick: Chapter 4',
        plot: 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',
        releaseYear: 2023,
        runtime: 169,
        rating: 7.7,
        poster: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
        director: 'Chad Stahelski',
        genres: ['Action', 'Crime', 'Thriller'],
        cast: [
            { name: 'Keanu Reeves', character: 'John Wick' },
            { name: 'Donnie Yen', character: 'Caine' },
            { name: 'Bill Skarsgård', character: 'Marquis de Gramont' },
            { name: 'Laurence Fishburne', character: 'The Bowery King' }
        ]
    },
    // Comedy
    {
        id: 'movie-30',
        title: 'The Grand Budapest Hotel',
        plot: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotels glorious years under an exceptional concierge.',
        releaseYear: 2014,
        runtime: 99,
        rating: 8.1,
        poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/2bXbqYdUdNVa8VIWXVHclYkFG3.jpg',
        director: 'Wes Anderson',
        genres: ['Adventure', 'Comedy', 'Crime'],
        cast: [
            { name: 'Ralph Fiennes', character: 'M. Gustave' },
            { name: 'Tony Revolori', character: 'Zero' },
            { name: 'Saoirse Ronan', character: 'Agatha' },
            { name: 'Adrien Brody', character: 'Dmitri' }
        ]
    },
    // Turkish Series
    {
        id: 'movie-31',
        title: 'Kurtlar Vadisi Pusu',
        plot: 'An intense Turkish action drama series following Polat Alemdar and his team as they combat shadowy organizations and forces seeking to destabilize Turkey. The series delves into themes of politics, national security, and Middle Eastern conflicts.',
        releaseYear: 2007,
        runtime: 90,
        rating: 8.5,
        poster: '/kurtlar_vadisi_pusu.jpg',
        backdrop: '/kurtlar_vadisi_pusu.jpg',
        director: 'Sadullah Şentürk',
        genres: ['Action', 'Drama', 'Thriller'],
        cast: [
            { name: 'Necati Şaşmaz', character: 'Polat Alemdar' },
            { name: 'Gürkan Uygun', character: 'Memati Baş' },
            { name: 'Kenan Çoban', character: 'Abdülhey Çoban' },
            { name: 'Erhan Ufak', character: 'Güllü Erhan' }
        ]
    }
];

async function seed() {
    const session = driver.session();

    try {
        console.log('🎬 MovieHub Database Seeder');
        console.log('===========================\n');

        console.log('🗑️  Clearing existing data...');
        await session.run('MATCH (n) DETACH DELETE n');

        console.log('📋 Creating constraints...');
        try {
            await session.run('CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE');
            await session.run('CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE');
            await session.run('CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE');
            await session.run('CREATE CONSTRAINT director_name IF NOT EXISTS FOR (d:Director) REQUIRE d.name IS UNIQUE');
            await session.run('CREATE CONSTRAINT actor_name IF NOT EXISTS FOR (a:Actor) REQUIRE a.name IS UNIQUE');
        } catch (e) {
            console.log('   Constraints may already exist, continuing...');
        }

        console.log('\n🎥 Seeding movies...\n');
        for (const movie of movies) {
            // Create movie
            await session.run(`
        CREATE (m:Movie {
          id: $id,
          title: $title,
          plot: $plot,
          releaseYear: $releaseYear,
          runtime: $runtime,
          rating: $rating,
          poster: $poster,
          backdrop: $backdrop
        })
      `, movie);

            // Create director and relationship
            await session.run(`
        MATCH (m:Movie {id: $movieId})
        MERGE (d:Director {name: $directorName})
        MERGE (m)-[:DIRECTED_BY]->(d)
      `, { movieId: movie.id, directorName: movie.director });

            // Create genres and relationships
            for (const genre of movie.genres) {
                await session.run(`
          MATCH (m:Movie {id: $movieId})
          MERGE (g:Genre {name: $genreName})
          MERGE (m)-[:IN_GENRE]->(g)
        `, { movieId: movie.id, genreName: genre });
            }

            // Create actors and relationships
            for (const actor of movie.cast) {
                await session.run(`
          MATCH (m:Movie {id: $movieId})
          MERGE (a:Actor {name: $actorName})
          MERGE (m)-[:HAS_ACTOR {character: $character}]->(a)
        `, { movieId: movie.id, actorName: actor.name, character: actor.character });
            }

            console.log(`   ✅ ${movie.title} (${movie.releaseYear})`);
        }

        // Create sample users
        console.log('\n👤 Creating sample users...');
        const userPassword = await bcrypt.hash('password123', 10);
        const adminPassword = await bcrypt.hash('admin', 10);

        await session.run(`
      CREATE (u:User {
        id: 'user-admin',
        username: 'admin',
        email: 'admin@example.com',
        password: $password,
        role: 'admin',
        createdAt: datetime()
      })
    `, { password: adminPassword });

        await session.run(`
      CREATE (u:User {
        id: 'user-1',
        username: 'demo',
        email: 'demo@example.com',
        password: $password,
        role: 'user',
        createdAt: datetime()
      })
    `, { password: userPassword });

        await session.run(`
      CREATE (u:User {
        id: 'user-2',
        username: 'moviefan',
        email: 'fan@example.com',
        password: $password,
        role: 'user',
        createdAt: datetime()
      })
    `, { password: userPassword });
        console.log('   ✅ admin@example.com / admin (Admin)');
        console.log('   ✅ demo@example.com / password123');
        console.log('   ✅ fan@example.com / password123');

        // Create sample reviews
        console.log('\n⭐ Creating sample reviews...');
        const reviews = [
            { userId: 'user-1', movieId: 'movie-11', rating: 10.0, text: "The Matrix is a revolutionary masterpiece! It changed cinema forever. The action, philosophy, and visual effects are unmatched." },
            { userId: 'user-2', movieId: 'movie-11', rating: 10.0, text: "Red pill or blue pill? This movie will blow your mind! Keanu Reeves is absolutely legendary as Neo." },
            { userId: 'user-admin', movieId: 'movie-11', rating: 10.0, text: "A groundbreaking sci-fi thriller that defined a generation. The bullet-time effects are still iconic today!" },
            { userId: 'user-1', movieId: 'movie-31', rating: 9.8, text: "Kurtlar Vadisi Pusu is an absolute masterpiece of Turkish television! The action, drama, and patriotic themes are unmatched." },
            { userId: 'user-2', movieId: 'movie-31', rating: 9.7, text: "Polat Alemdar is the most iconic character in Turkish TV history. This series is legendary!" },
            { userId: 'user-admin', movieId: 'movie-31', rating: 9.6, text: "A gripping political thriller that keeps you on the edge of your seat. Must watch!" },
            { userId: 'user-1', movieId: 'movie-1', rating: 9.5, text: "An absolute masterpiece! Heath Ledger's Joker is legendary and defines the superhero genre." },
            { userId: 'user-1', movieId: 'movie-2', rating: 9.0, text: "Mind-bending and visually stunning. Nolan at his best! The ending still gives me chills." },
            { userId: 'user-1', movieId: 'movie-15', rating: 10.0, text: "The greatest movie ever made. A story of hope and perseverance that resonates with everyone." },
            { userId: 'user-1', movieId: 'movie-5', rating: 9.0, text: "Tarantino's dialogue is unmatched. Every scene is iconic and quotable." },
            { userId: 'user-2', movieId: 'movie-1', rating: 9.0, text: "Why so serious? Because this movie is seriously good!" },
            { userId: 'user-2', movieId: 'movie-16', rating: 9.5, text: "An offer you can't refuse - to watch this masterpiece." },
            { userId: 'user-2', movieId: 'movie-11', rating: 8.5, text: "Red pill or blue pill? After watching this, you'll question reality." },
            { userId: 'user-2', movieId: 'movie-13', rating: 9.0, text: "Dune Part Two exceeded all expectations. Visually stunning!" },
            { userId: 'user-1', movieId: 'movie-19', rating: 9.0, text: "Parasite deserved every Oscar it won. A perfect film." },
            { userId: 'user-2', movieId: 'movie-4', rating: 8.5, text: "Cillian Murphy delivers an Oscar-worthy performance." },
        ];

        for (const review of reviews) {
            await session.run(`
        MATCH (u:User {id: $userId}), (m:Movie {id: $movieId})
        CREATE (u)-[:REVIEWED {
          id: randomUUID(),
          rating: $rating,
          text: $text,
          createdAt: datetime()
        }]->(m)
      `, review);
        }
        console.log(`   ✅ Added ${reviews.length} reviews`);

        // Create views for trending
        console.log('\n👁️  Creating views for trending...');
        const viewedMovies = ['movie-11', 'movie-11', 'movie-11', 'movie-11', 'movie-11', 'movie-31', 'movie-31', 'movie-1', 'movie-2', 'movie-4', 'movie-13', 'movie-23', 'movie-24', 'movie-8', 'movie-9'];
        for (const movieId of viewedMovies) {
            await session.run(`
        MATCH (u:User {id: 'user-1'}), (m:Movie {id: $movieId})
        CREATE (u)-[:VIEWED {date: datetime(), count: $count}]->(m)
      `, { movieId, count: Math.floor(Math.random() * 10) + 1 });

            await session.run(`
        MATCH (u:User {id: 'user-2'}), (m:Movie {id: $movieId})
        CREATE (u)-[:VIEWED {date: datetime(), count: $count}]->(m)
      `, { movieId, count: Math.floor(Math.random() * 10) + 1 });
        }
        console.log('   ✅ Views added for trending calculation');

        // Print stats
        console.log('\n📊 Database Statistics');
        console.log('======================');
        const stats = await session.run(`
      MATCH (m:Movie) WITH count(m) as movies
      MATCH (a:Actor) WITH movies, count(a) as actors
      MATCH (d:Director) WITH movies, actors, count(d) as directors
      MATCH (g:Genre) WITH movies, actors, directors, count(g) as genres
      MATCH (u:User) WITH movies, actors, directors, genres, count(u) as users
      MATCH ()-[r:REVIEWED]->() WITH movies, actors, directors, genres, users, count(r) as reviews
      RETURN movies, actors, directors, genres, users, reviews
    `);
        const s = stats.records[0];
        console.log(`   🎬 Movies:    ${s.get('movies')}`);
        console.log(`   🎭 Actors:    ${s.get('actors')}`);
        console.log(`   🎬 Directors: ${s.get('directors')}`);
        console.log(`   🏷️  Genres:    ${s.get('genres')}`);
        console.log(`   👤 Users:     ${s.get('users')}`);
        console.log(`   ⭐ Reviews:   ${s.get('reviews')}`);

        console.log('\n✅ Database seeded successfully!\n');
        console.log('🚀 You can now access the movie website at http://localhost:5173');

    } catch (error) {
        console.error('\n❌ Error seeding database:', error.message);
        console.log('\n💡 Make sure Neo4j is running and credentials are correct in .env');
    } finally {
        await session.close();
        await driver.close();
    }
}

seed();
