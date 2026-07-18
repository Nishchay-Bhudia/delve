using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;

namespace HanumanQuest.Game;

/// <summary>
/// JS interop surface. Kept to primitive types (double[], string, bool) that
/// the JSImport source generator marshals without extra attributes — every
/// non-numeric "type" (which wall, which creature) travels as an integer
/// code inside a double[] rather than as a string array, since that's the
/// well-supported path.
/// </summary>
[SupportedOSPlatform("browser")]
internal static partial class Interop
{
    private const string Module = "gamejs";

    public static async System.Threading.Tasks.Task LoadAsync() =>
        await JSHost.ImportAsync(Module, "./game.js");

    [JSImport("init", Module)]
    public static partial void Init(string canvasId, int width, int height);

    /// <summary>Returns [forward, back, left, right, mouseDx, watchHeld].</summary>
    [JSImport("getInput", Module)]
    public static partial double[] GetInput();

    /// <summary>
    /// wallData: interleaved [dist0, typeCode0, dist1, typeCode1, ...] one pair per screen column.
    /// spriteData: interleaved [screenXFrac, dist, creatureTypeCode, calmProgress] per visible, un-calmed creature.
    /// </summary>
    [JSImport("render", Module)]
    public static partial void Render(
        double[] wallData,
        double[] spriteData,
        string hudText,
        string toastText,
        bool won);
}
