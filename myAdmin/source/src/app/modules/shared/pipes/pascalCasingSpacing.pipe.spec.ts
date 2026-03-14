import { PascalCasingSpacingPipe } from "./_index";

const pipe = new PascalCasingSpacingPipe();

describe("PascalCasingSpacingPipe", () => {
    it("should transform \"NotRegistered\" to \"Not Registered\"", () => {
        const input = "NotRegistered";
        const expected = "Not Registered";

        expect(pipe.transform(input)).toEqual(expected);
    });

    it("should transform \"Inactive\" to \"Inactive\"", () => {
        const input = "Inactive";
        const expected = "Inactive";

        expect(pipe.transform(input)).toEqual(expected);
    });

    it("should transform \"RegistrationCompleteInProcess\" to \"Registration Complete In Process\"", () => {
        const input = "RegistrationCompleteInProcess";
        const expected = "Registration Complete In Process";

        expect(pipe.transform(input)).toEqual(expected);
    });

    it("should transform \"    ChallengeInProcess     \" to \"Challenge In Process\"", () => {
        const input = "    ChallengeInProcess     ";
        const expected = "Challenge In Process";

        expect(pipe.transform(input)).toEqual(expected);
    });

    it("should transform \"    None     \" to \"None\"", () => {
        const input = "    None     ";
        const expected = "None";

        expect(pipe.transform(input)).toEqual(expected);
    });

    it("should transform \"UBIMobileRegistrationStatus\" to \"UBI Mobile Registration Status\"", () => {
        const input = "UBIMobileRegistrationStatus";
        const expected = "UBI Mobile Registration Status";

        expect(pipe.transform(input)).toEqual(expected);
    });
});