const {Model, DataTypes} = require("sequelize");

//Schema for SetsReps table
module.exports = (sequelize) => {
    class SetsReps extends Model {};
    SetsReps.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        setNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        repetitions: {
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