using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Api.RequestModels;

namespace Progressive.Telematics.Admin.Api.Attributes
{
    public sealed class DateCannotBeLaterThanToday : ValidationAttribute
    {
        public DateCannotBeLaterThanToday()
        {
            ErrorMessage = "Date cannot be greater than today";
        }

        public override bool IsValid(object value)
        {
            var date = Convert.ToDateTime(value).Date;
            return date <= DateTime.Today;
        }
    }

    public sealed class DateMustBeEarlierThanToday : ValidationAttribute
    {
        public DateMustBeEarlierThanToday()
        {
            ErrorMessage = "Date must be earlier than today";
        }

        public override bool IsValid(object value)
        {
            var date = Convert.ToDateTime(value);
            return date < DateTime.Today;
        }
    }

    public sealed class EndDateMustBeGreaterThanStartDate : ValidationAttribute
    {
        public EndDateMustBeGreaterThanStartDate()
        {
            ErrorMessage = "End date must be earlier than the start date";
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var date = Convert.ToDateTime(value);
            var request = (IDateRequest)validationContext.ObjectInstance;
            return date > request.StartDate ? ValidationResult.Success : new ValidationResult(ErrorMessage);
        }
    }

    public sealed class ValidTelematicsId : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return ValidationResult.Success;
            }

            Guid validatedTelematicsId;
            bool isValidGuid = Guid.TryParse(value.ToString().Trim(), out validatedTelematicsId);

            if (isValidGuid && validatedTelematicsId != default(Guid))
            {
                return ValidationResult.Success;
            }
            else
            {
                return new ValidationResult($"Invalid Telematics ID value provided.");
            }
        }
    }
}
