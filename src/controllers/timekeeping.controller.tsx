import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { UserProfile } from './models/UserProfile'; // Assuming you have a UserProfile model defined
import { DatabaseError } from './errors'; // Custom error class for database errors

let isInitialized = false;

export function initializeSimpleMembership() {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!isInitialized) {
            try {
                await simpleMembershipInitializer();
                isInitialized = true;
            } catch (ex) {
                next(new Error("The ASP.NET Simple Membership database could not be initialized. For more information, please see http://go.microsoft.com/fwlink/?LinkId=256588"));
                return;
            }
        }
        next();
    };
}

async function simpleMembershipInitializer() {
    // Disable Sequelize automatic migrations
    const sequelize = new Sequelize({
        database: 'TimekeepDBContext',
        dialect: 'mssql', // or your database dialect
        models: [UserProfile],
        logging: false,
    });

    try {
        // Check if database exists by authenticating connection
        await sequelize.authenticate();

        // Check if UserProfile table exists, create if not
        const tableExists = await sequelize.getQueryInterface().showAllTables()
            .then(tables => tables.includes('UserProfiles'));

        if (!tableExists) {
            await sequelize.sync({ force: false });
        }

        // Initialize membership logic here if needed
        // For example, ensure UserProfile table has required columns, etc.

    } catch (error) {
        throw new DatabaseError(error);
    }
}