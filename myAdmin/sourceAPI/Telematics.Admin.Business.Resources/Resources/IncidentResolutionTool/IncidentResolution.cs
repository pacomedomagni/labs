using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Resources;
public class IncidentResolutionDataModel
    {
        public int IncidentResolutionSeqId { get; set; }

        public string KBAId { get; set; }

        public string KBADescription { get; set; }

        public int StepNumber { get; set; }

        public string StoredProcedureName { get; set; }

        public DateTime? CreateDateTime { get; set; }

        public DateTime? LastChangeDateTime { get; set; }

        public string LastChangeUserId { get; set; }
    }
