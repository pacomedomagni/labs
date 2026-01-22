using System;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Labs.Api.RequestModels;

namespace Progressive.Telematics.Labs.Api.Attributes
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
}

