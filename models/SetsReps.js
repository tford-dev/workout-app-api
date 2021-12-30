import { Model, DataTypes } from "sequelize";

//Schema for SetsReps table
export default (sequelize) => {
    class SetsReps extends Model {};
    SetsReps.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        SetNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        Repetitions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {sequelize});

    //Data association with Exercise table
    SetsReps.associate = (models) => {
        SetsReps.belongsTo(models.Exercise, {
            as: "exercise-sets-reps",
            foreignKey: {
                fieldName: "exerciseId",
                allowNull: false,
            }
        })
    }
    return SetsReps;
};