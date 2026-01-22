using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Progressive.Telematics.Labs.Shared
{
    internal class AssemblyHelper
    {
        public static List<Assembly> GetLoadedAssemblies(params string[] scanAssembliesStartsWith)
        {
            return loadAssemblies(scanAssembliesStartsWith);
        }

        //[SuppressMessage("Maintainability", "CA1508:Avoid dead conditional code", Justification = "Wrong analysis")]
        private static List<Assembly> loadAssemblies(params string[] scanAssembliesStartsWith)
        {
            HashSet<Assembly> loadedAssemblies = new HashSet<Assembly>();

            List<string> assembliesToBeLoaded = new List<string>();

            string appDllsDirectory = AppDomain.CurrentDomain.BaseDirectory;

            if (scanAssembliesStartsWith?.Any() == true)
            {
                if (scanAssembliesStartsWith.Length == 1)
                {
                    string searchPattern = $"{scanAssembliesStartsWith.First()}*.dll";
                    string[] assemblyPaths = Directory.GetFiles(appDllsDirectory, searchPattern, SearchOption.AllDirectories);
                    assembliesToBeLoaded.AddRange(assemblyPaths);
                }

                if (scanAssembliesStartsWith.Length > 1)
                {
                    foreach (string starsWith in scanAssembliesStartsWith)
                    {
                        string searchPattern = $"{starsWith}*.dll";
                        string[] assemblyPaths = Directory.GetFiles(appDllsDirectory, searchPattern, SearchOption.AllDirectories);
                        assembliesToBeLoaded.AddRange(assemblyPaths);
                    }
                }
            }
            else
            {
                string[] assemblyPaths = Directory.GetFiles(appDllsDirectory, "*.dll");
                assembliesToBeLoaded.AddRange(assemblyPaths);
            }

            foreach (string path in assembliesToBeLoaded)
            {
                try
                {
                    Assembly assembly = Assembly.LoadFrom(path);
                    loadedAssemblies.Add(assembly);
                }
                catch (Exception)
                {
                    continue;
                }
            }

            return loadedAssemblies.ToList();
        }
    }
}

