import { UnenrollmentParticipantComponent } from "./unenroll-participant.component";
import { NgForm } from "@angular/forms";

function setup() {
  const injectedData = {
    model: { unenrollmentReasons: ["Reason 1", "Reason 2"] },
    form: new NgForm([], [])
  };

  const builder = {
    default() {
      return builder;
    },
    build() {
      return new UnenrollmentParticipantComponent(injectedData);
    }
  };

  return builder;
}

describe("UnenrollmentParticipantComponent", () => {

  it("should create", () => {
    const { build } = setup().default();
    const component = build();
    expect(component).toBeTruthy();
  });

});