
USE cinebook;

INSERT INTO movies
(movie_id, title, poster, language, genre, duration, ticket_price, status)
VALUES
(1, 'Avengers Endgame: Encore', 'Avengers Endgame.jpg',
 'English', 'Action, Adventure', '3 hr 1 min', 180.00, 'Now Showing'),

(2, 'Doraemon: Castle of the Undersea Devil', 'Doraemon.jpg',
 'Japanese', 'Animation, Adventure', '1 hr 35 min', 360.00, 'Now Showing'),

(3, 'Mirzapur: The Movie', 'Mirzapur.jpg',
 'Hindi', 'Action, Thriller', 'Not specified', 400.00, 'Now Showing'),

(4, 'Spider-Man: Brand New Day', 'Spider Man.jpg',
 'English', 'Action, Adventure', '2 hr 25 min', 520.00, 'Now Showing'),

(5, 'The Paradise', 'Paradise.jpg',
 'Check local listings', 'Action, Drama', '2 hr 54 min', 300.00, 'Now Showing'),

(6, 'Heart of the Beast', 'Heart of the Beast.jpg',
 'Check local listings', 'Action, Adventure', '1 hr 45 min', 200.00, 'Coming Soon')

ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    poster = VALUES(poster),
    language = VALUES(language),
    genre = VALUES(genre),
    duration = VALUES(duration),
    ticket_price = VALUES(ticket_price),
    status = VALUES(status);
