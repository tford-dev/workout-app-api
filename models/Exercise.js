import { Model, DataTypes } from "sequelize";

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
    //Data association with SetsReps table
    Exercise.associate = (models) => {
        Exercise.hasMany = (models.SetsReps, {
            as: "exercise-sets-reps",
            foreignKey: {
                fieldName: "exerciseId",
                allowNull: false,
            }
        })
    }
    return Exercise;
};