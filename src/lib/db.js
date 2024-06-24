
const path = require('path');
const { DataTypes, Op, Sequelize } = require('sequelize');


const getInstance = function(fileName) {
    return new Sequelize({
        dialect: 'sqlite',
        quoteIdentifiers: false,
        storage: path.join(__dirname, '..', '..', 'db', fileName),
        define: {
            timestamps: false
        }
    })
}

const movies = getInstance('movies.db')
const ratings = getInstance('ratings.db')

const MovieModel = movies.define('movies', {
    movieId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    imdbId: {
        type: DataTypes.TEXT
    },
    title: {
        type: DataTypes.TEXT
    },
    overview: {
        type: DataTypes.TEXT
    },
    productionCompanies: {
        type: DataTypes.TEXT
    },
    releaseDate: {
        type: DataTypes.TEXT
    },
    budget: {
        type: DataTypes.INTEGER
    },
    revenue: {
        type: DataTypes.INTEGER
    },
    runtime: {
        type: DataTypes.REAL
    },
    language: {
        type: DataTypes.TEXT
    },
    genres: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.TEXT
    }
}, {

})

const RatingModel = ratings.define('ratings', {
    ratingId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER
    },
    movieId: {
        type: DataTypes.INTEGER
    },
    rating: {
        type: DataTypes.REAL
    },
    timestamp: {
        type: DataTypes.INTEGER
    }
}, {
    
})

module.exports = {
    MovieModel,
    Op: Sequelize.Op,
    RatingModel,
    ratingsDb: ratings
}
