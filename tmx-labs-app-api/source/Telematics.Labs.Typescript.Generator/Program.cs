using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;

namespace Telematics.Admin.Typescript.Generator
{
    class Program
    {
        static void Main(string[] args)
        {
            var assemblies = new List<string>
            {
                "Progressive.Telematics.Labs.Business.Resources",
                "Progressive.Telematics.Labs.Services"
            };

            var models = new List<Type>();
            assemblies.ForEach(x => models.AddRange(Assembly.Load(x).GetTypes().Where(x => x.GetCustomAttribute<TsEnumAttribute>() != null)));
            var generator = new TypeScriptFluent()
                .WithEnumMode(TsEnumModes.Number)
                .AsConstEnums(false);

            models.OrderBy(x => x.Name).ToList().ForEach(x => generator.ModelBuilder.Add(x));
            var enumMap = new StringBuilder();
            Action<TsGeneratorOutput> enumWriter = (outputGenerator) =>
            {
                var data = generator.Generate(outputGenerator);
                string line, currentEnum = string.Empty;
                using var reader = new StringReader(data);
                bool startedWrite = false;
                while ((line = reader.ReadLine()) != null)
                {
                    if (line.Contains("export"))
                    {
                        startedWrite = true;
                        currentEnum = line.Split(' ')[2];
                        enumMap.AppendLine(line
                            .Replace("enum", "const")
                            .Replace(currentEnum, currentEnum + "Value")
                            .Replace("{", string.Empty) + $"= new Map<{currentEnum}, number>([");
                    }
                    else if (line.Contains("}") && startedWrite)
                    {
                        startedWrite = false;
                        enumMap.AppendLine("\t]);");
                    }
                    else if (startedWrite)
                    {
                        var enumData = line.Split(" = ");
                        var enumType = enumData[0].Replace("\t", string.Empty);
                        var enumValue = int.Parse(enumData[1].Replace(",", string.Empty));
                        enumMap.AppendLine($"\t\t[{currentEnum}.{enumType}, {enumValue}],");
                    }
                }
            };
            enumWriter(TsGeneratorOutput.Enums);


            models = new List<Type>();
            assemblies.ForEach(x => models.AddRange(Assembly.Load(x).GetTypes().Where(x => x.GetCustomAttribute<TsClassAttribute>() != null || x.GetCustomAttribute<TsEnumAttribute>() != null)));

            generator = new TypeScriptFluent()
                .WithConvertor<Guid>(x => "string")
                .WithConvertor<Dictionary<string, object>>(x => "Map<string, any>")
                .WithConvertor<Dictionary<MessageCode, string>>(x => "Map<MessageCode, any>")
                .WithMemberFormatter(x => char.ToLower(x.Name[0]) + x.Name.Substring(1))
                .WithEnumMode(TsEnumModes.String)
                .AsConstEnums(false);

            models.OrderBy(x => x.Name).ToList().ForEach(x => generator.ModelBuilder.Add(x));

            var directory = Directory.GetCurrentDirectory().Substring(0, Directory.GetCurrentDirectory().IndexOf("bin"));

            Action<TsGeneratorOutput, string> writer = (outputGenerator, fileName) =>
            {
                var tsDefinitions = generator.Generate(outputGenerator)
                    .Replace("Progressive.Telematics.Labs.Business.Resources.", string.Empty)
                    .Replace("Progressive.Telematics.Labs.Services.Models.", string.Empty)
                    .Replace("interface", "export interface")
                    .Replace("System.TimeSpan", "TimeSpan")
                    .Replace("System.Collections.Generic.", string.Empty);

                tsDefinitions = tsDefinitions.Replace("\"", "'");

                if (outputGenerator == TsGeneratorOutput.Properties)
                    tsDefinitions = tsDefinitions.Insert(0, "import * as Enums from './enums';" + Environment.NewLine);

                var modifiedData = new StringBuilder();
                string line, previousLine;
                using var reader = new StringReader(tsDefinitions);
                while ((line = reader.ReadLine()) != null)
                {
                    if (!line.Contains("namespace") && !line.StartsWith("}"))
                        modifiedData.AppendLine(line);
                    previousLine = line;
                }

                if (outputGenerator == TsGeneratorOutput.Enums)
                    modifiedData.AppendLine(enumMap.ToString());

                File.WriteAllText(Path.Combine(directory, fileName), modifiedData.ToString());
            };

            writer(TsGeneratorOutput.Enums, "enums.ts");
            writer(TsGeneratorOutput.Properties, "resources.ts");
        }
    }
}

