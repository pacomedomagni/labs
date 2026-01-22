using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;
using TypeLitePlus.TsModels;

public class TypescriptGenerator
{
    public void Generate()
    {
        var ts = TypeScript.Definitions()
            .ForReferencedAssembly("Progressive.Telematics.Labs.Business.Resources")
            .WithConvertor<Guid>(x => "string")
            .WithConvertor<Dictionary<string, object>>(x => "Map<string, any>")
            .WithConvertor<Dictionary<MessageCode, string>>(x => "Map<MessageCode, any>")
            .WithMemberFormatter(x => char.ToLower(x.Name[0]) + x.Name.Substring(1))
            .AsConstEnums(false);

        var data = ts.Generate()
            .Insert(0, "// TMX ADMIN APP AUTO-GENERATED RESOURCES")
            .Replace("Progressive.Telematics.Labs.Business.Resources.", string.Empty)
            .Replace("Enums.", string.Empty)
            .Replace("interface", "export interface")
            .Replace("System.TimeSpan", "TimeSpan")
            //.Replace("policyNumber: string;", "policyNumber: ID;")
            .Replace("System.Collections.Generic.", string.Empty);

        var modifiedData = new StringBuilder();
        string line;
        string previousLine;
        using var reader = new StringReader(data);
        while (true)
        {
            line = reader.ReadLine();
            if (string.IsNullOrEmpty(line) || line.Contains("interface IKeyValuePair"))
                break;
            if (!line.StartsWith("declare namespace") && !line.StartsWith("}"))
                modifiedData.AppendLine(line);
            previousLine = line;
        }

        File.WriteAllText(Directory.GetCurrentDirectory() + "\\Resources.ts", modifiedData.ToString());
    }
}

