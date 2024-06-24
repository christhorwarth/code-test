
const _ = require('lodash');
const db = require('./lib/db');
const express = require('express');
require('express-async-errors');
const formatter = require('./lib/formatter');
const joi = require('joi');

const app = express();

app.disable('x-powered-by');

const listMoviesSchema = joi.object().keys({
    dir: joi.valid('asc', 'desc').default('asc'),
    formatBudget: joi.boolean(),
    genre: joi.string(),
    genreId: joi.number().integer(),
    page: joi.number().integer().min(1).default(1),
    sort: joi.valid('releaseDate', 'title').default('releaseDate'),
    year: joi.number().integer().min(1800).max(2025)
})

app.get('/movies', async function(req, res) {
    const validated = await listMoviesSchema.validateAsync({
        dir: req.query.dir,
        formatBudget: req.query.format_budget,
        genre: req.query.genre,
        genreId: req.query.genre_id,
        page: req.query.page,
        sort: req.query.sort,
        year: req.query.year
    })

    const size = 50
    const moviesRes = await db.MovieModel.findAndCountAll({
        limit: size,
        offset: (validated.page - 1) * size,
        order: [[validated.sort, validated.dir]],
        where: {
            ...(validated.year ? {
                releaseDate: {
                    [db.Op.gte]: `${validated.year}-01-01`,
                    [db.Op.lte]: `${validated.year}-12-31`
                }
            } : undefined),
            ...(validated.genre | validated.genreId ? {
                genres: {
                    ...(validated.genre ? {
                        [db.Op.like]: `%"name": "${validated.genre}"%`
                    } : {
                        [db.Op.like]: `%"id": ${validated.genreId},%`
                    })
                }
            } : undefined)
        }
    })

    res.status(200).json({
        success: true,
        response: {
            count: moviesRes.count,
            items: _.map(moviesRes.rows, function(movie) {
                return {
                    budget: validated.formatBudget ? formatter.currency(movie.budget) : movie.budget,
                    genres: movie.genres ? JSON.parse(movie.genres) : null,
                    imdb_id: movie.imdbId || null,
                    release_date: movie.releaseDate || null,
                    title: movie.title
                }
            }),
            pagination: {
                current: validated.page,
                total: Math.ceil(moviesRes.count / size)
            }
        }
    });
});

const getMovieSchema = joi.object().keys({
    movieId: joi.number().integer().required()
})

app.get('/movies/:movieId', async function(req, res) {
    const validated = await getMovieSchema.validateAsync({
        movieId: req.params.movieId
    })

    const movieRes = await db.MovieModel.findOne({
        where: {
            movieId: validated.movieId
        }
    })

    if (!movieRes) {
        return next('NOT_FOUND');
    }

    const ratingsRes = await db.ratingsDb.query(`select avg(rating) from ratings where movieId = ${movieRes.movieId}`)
    res.status(200).json({
        success: true,
        response: {
            average_rating: _.get(ratingsRes, [0, 0, 'avg(rating)']),
            budget: formatter.currency(movieRes.budget),
            description: movieRes.overview,
            genres: movieRes.genres ? JSON.parse(movieRes.genres) : null,
            imdb_id: movieRes.imdbId || null,
            original_language: movieRes.language || null,
            production_companies: movieRes.productionCompanies ? JSON.parse(movieRes.productionCompanies) : null,
            release_date: movieRes.releaseDate || null,
            runtime: movieRes.runtime,
            title: movieRes.title
        }
    });
});

app.use(function (req, res, next) {
    next('NOT_FOUND');
});

app.use(function (err, req, res, next) {
    console.log('Error:', err);
    res.status(err === 'NOT_FOUND' ? 404 : 503).json({
        success: false,
        error: {
            code: _.get(err, 'details[0].message') || _.get(err, 'code') || err
        }
    });
});

const port = 3000;
app.listen(port, function() {
    console.info('Running on port', port);
});
