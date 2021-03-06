const {Model, DataTypes} = require("sequelize");

//Schema for Workouts table
module.exports = (sequelize) => {
    class Workout extends Model {};
    Workout.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        time: {
            type: DataTypes.STRING,
            allowNull: false
        },

    }, {sequelize});

    //Data association with User table
    Workout.associate = (models) => {
        Workout.belongsTo(models.User, {
            as: "workout-creator",
            foreignKey: {
                fieldName: "userId",
                allowNull: false,
                onDelete: 'cascade'
            },
        });
    };
    //Data association with Exercise table
    Workout.associate = (models) => {
        Workout.hasMany(models.Exercise, {
            as: 'workout-exercise',
            foreignKey: {
                fieldName: 'workoutId',
                allowNull: false,
            },
        })
    };
    return Workout;
};