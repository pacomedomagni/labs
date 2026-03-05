CREATE OR ALTER PROCEDURE [dbo].[usp_FulfillmentOrder_SelectByStatus]
    @Parm_StatusCodes VARCHAR(50) -- comma-separated status codes e.g. '1,2' or '3'
AS
BEGIN
    SET NOCOUNT ON;

    -- Parse comma-separated status codes into a table
    ;WITH StatusCodes AS (
        SELECT CAST(value AS INT) AS StatusCode
        FROM STRING_SPLIT(@Parm_StatusCodes, ',')
    )

    SELECT
        do.DeviceOrderSeqID,
        do.CreateDateTime,
        do.DeviceOrderStatusCode,
        dos.Description                         AS StatusDescription,
        do.ParticipantGroupSeqID,
        pg.ParticipantGroupExternalKey,
        do.ShipDateTime,
        do.ProcessedDateTime,
        do.FulfilledByUserID,
        COUNT(dod.DeviceOrderDetailSeqID)       AS DeviceDetailCount,
        STRING_AGG(xd.DeviceSerialNumber, ',')  AS DeviceSerialNumbers,
        STRING_AGG(xv.Description, ',')         AS XirgoVersionDescriptions,
        CASE
            WHEN COUNT(DISTINCT p.MobileSummarizerVersionCode) = 1
            THEN CAST(MIN(p.MobileSummarizerVersionCode) AS VARCHAR(10))
            ELSE NULL
        END                                      AS SnapshotVersionCode
    FROM dbo.DeviceOrder do
    INNER JOIN StatusCodes sc
        ON do.DeviceOrderStatusCode = sc.StatusCode
    INNER JOIN dbo.DeviceOrderStatus dos
        ON do.DeviceOrderStatusCode = dos.Code
    INNER JOIN dbo.ParticipantGroup pg
        ON do.ParticipantGroupSeqID = pg.ParticipantGroupSeqID
    LEFT JOIN dbo.DeviceOrderDetail dod
        ON do.DeviceOrderSeqID = dod.DeviceOrderSeqID
    LEFT JOIN [LabsHomebase].dbo.XirgoDevice xd
        ON dod.DeviceSeqID = xd.DeviceSeqID
    LEFT JOIN [LabsHomebase].dbo.XirgoVersion xv
        ON xd.VersionCode = xv.Code
    LEFT JOIN dbo.Participant p
        ON dod.ParticipantSeqID = p.ParticipantSeqID
    GROUP BY
        do.DeviceOrderSeqID,
        do.CreateDateTime,
        do.DeviceOrderStatusCode,
        dos.Description,
        do.ParticipantGroupSeqID,
        pg.ParticipantGroupExternalKey,
        do.ShipDateTime,
        do.ProcessedDateTime,
        do.FulfilledByUserID
    ORDER BY do.CreateDateTime ASC;
END
