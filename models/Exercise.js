import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

//Schema for Exercises
module.exports = (sequelize) => {
    class Exercise extends Model {};
    Exercise.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        sets: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        repetitions: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

    }, {sequelize});

    //Data association with Workout table
    Exercise.associate = (models) => {
        Exercise.belongsTo(models.Workout, {
            as: "workout-exercise",
            foreignKey: {
                fieldName: "workoutId",
                allowNull: false,
            },
        })
    };
    return Exercise;
};