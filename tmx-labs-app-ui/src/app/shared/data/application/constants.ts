import { MessageCode, States } from './enums';

/*
/ User role constants, these map to the boolean fields from GetUserRoles API
*/
export const UserRoles = {
    LabsUser: "isLabsUser",
    LabsAdmin: "isLabsAdmin"
};

export const ProgressiveHQCoordinates = {
    latitude: 41.563024,
    longitude: -81.443771,
};

export const StatesValue = new Map<States, number>([
    [States.AL, 1],
    [States.AK, 2],
    [States.AR, 3],
    [States.AZ, 4],
    [States.CA, 5],
    [States.CO, 6],
    [States.CT, 7],
    [States.DC, 8],
    [States.DE, 9],
    [States.FL, 10],
    [States.GA, 11],
    [States.HI, 12],
    [States.IA, 13],
    [States.ID, 14],
    [States.IL, 15],
    [States.IN, 16],
    [States.KS, 17],
    [States.KY, 18],
    [States.LA, 19],
    [States.MA, 20],
    [States.MD, 21],
    [States.ME, 22],
    [States.MI, 23],
    [States.MN, 24],
    [States.MO, 25],
    [States.MS, 26],
    [States.MT, 27],
    [States.NC, 28],
    [States.ND, 29],
    [States.NE, 30],
    [States.NH, 31],
    [States.NJ, 32],
    [States.NM, 33],
    [States.NV, 34],
    [States.NY, 35],
    [States.OK, 36],
    [States.OH, 37],
    [States.OR, 38],
    [States.PA, 39],
    [States.RI, 40],
    [States.SC, 41],
    [States.SD, 42],
    [States.TN, 43],
    [States.TX, 44],
    [States.UT, 45],
    [States.VA, 46],
    [States.VT, 47],
    [States.WA, 48],
    [States.WI, 49],
    [States.WV, 50],
    [States.WY, 51],
]);

export const MessageCodeValue = new Map<MessageCode, number>([
    [MessageCode.Error, 0],
    [MessageCode.ErrorCode, 1],
    [MessageCode.ErrorDetails, 2],
    [MessageCode.Handled, 3],
    [MessageCode.StackTrace, 4],
    [MessageCode.StatusCode, 5],
    [MessageCode.StatusDescription, 6],
]);


