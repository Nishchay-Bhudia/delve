using System;
using System.Collections.Generic;

namespace HanumanQuest.Game;

/// <summary>
/// A small first-person raycaster. You play Hanuman moving through a
/// clearing in the forest where three shadow-creatures — the same ones
/// from the scrapbook — are loose. There is no attack button: the only
/// way to settle a creature is to stand still and watch it. Walking into
/// one just blocks you, the same way fighting a creature in the story
/// only makes it bigger — so the game never lets you "win" by force.
/// </summary>
public sealed class RayGame
{
    public const int MapWidth = 15;
    public const int MapHeight = 11;

    // '#' outer wall, '+' inner pillar, '.' floor, '1'/'2'/'3' creature spawns (become floor once read).
    private static readonly string[] RawMap =
    {
        "###############",
        "#P............#",
        "#.............#",
        "#..++.....++..#",
        "#..++..1..++..#",
        "#.............#",
        "#....++.++....#",
        "#..2.......3..#",
        "#.............#",
        "#.............#",
        "###############",
    };

    private readonly int[,] _walls = new int[MapHeight, MapWidth]; // 0 floor, 1 outer wall, 2 pillar
    public List<Creature> Creatures { get; } = new();

    public double PlayerX { get; private set; }
    public double PlayerY { get; private set; }
    public double PlayerAngle { get; private set; }

    public int CalmedCount { get; private set; }
    public bool Won => CalmedCount >= Creatures.Count;
    public string? Toast { get; private set; }
    private double _toastTimer;

    private const double MoveSpeed = 2.4;      // grid units / second
    private const double MouseSensitivity = 0.0025;
    private const double PlayerRadius = 0.22;
    private const double CreatureRadius = 0.35;
    private const double WatchRange = 2.6;
    private const double WatchHalfAngle = 0.30; // radians, ~17 degrees either side
    private const double CalmSeconds = 2.6;

    public RayGame()
    {
        for (var row = 0; row < MapHeight; row++)
        {
            for (var col = 0; col < MapWidth; col++)
            {
                var c = RawMap[row][col];
                _walls[row, col] = c switch
                {
                    '#' => 1,
                    '+' => 2,
                    _ => 0,
                };

                switch (c)
                {
                    case 'P':
                        PlayerX = col + 0.5;
                        PlayerY = row + 0.5;
                        break;
                    case '1':
                        Creatures.Add(new Creature(1, "\U0001F412", col + 0.5, row + 0.5, "Chanchal the monkey"));
                        break;
                    case '2':
                        Creatures.Add(new Creature(2, "\U0001F418", col + 0.5, row + 0.5, "Bhaari the elephant"));
                        break;
                    case '3':
                        Creatures.Add(new Creature(3, "\U0001F99A", col + 0.5, row + 0.5, "Shaan the peacock"));
                        break;
                }
            }
        }

        PlayerAngle = 0;
    }

    private bool IsWall(double x, double y)
    {
        var col = (int)Math.Floor(x);
        var row = (int)Math.Floor(y);
        if (col < 0 || row < 0 || col >= MapWidth || row >= MapHeight) return true;
        return _walls[row, col] != 0;
    }

    /// <summary>Advances the simulation by <paramref name="dt"/> seconds.</summary>
    public void Update(double dt, double forward, double back, double left, double right, double mouseDx, bool watchHeld)
    {
        PlayerAngle += mouseDx * MouseSensitivity;

        var moveX = 0.0;
        var moveY = 0.0;
        var fwdAmount = forward - back;
        if (fwdAmount != 0)
        {
            moveX += Math.Cos(PlayerAngle) * fwdAmount;
            moveY += Math.Sin(PlayerAngle) * fwdAmount;
        }
        var strafeAmount = right - left;
        if (strafeAmount != 0)
        {
            moveX += Math.Cos(PlayerAngle + Math.PI / 2) * strafeAmount;
            moveY += Math.Sin(PlayerAngle + Math.PI / 2) * strafeAmount;
        }

        var isMoving = moveX != 0 || moveY != 0;
        if (isMoving)
        {
            var len = Math.Sqrt(moveX * moveX + moveY * moveY);
            moveX = moveX / len * MoveSpeed * dt;
            moveY = moveY / len * MoveSpeed * dt;

            TryMove(moveX, 0);
            TryMove(0, moveY);
        }

        UpdateCreatures(dt, watchHeld, isMoving);

        if (_toastTimer > 0)
        {
            _toastTimer -= dt;
            if (_toastTimer <= 0) Toast = null;
        }
    }

    private void TryMove(double dx, double dy)
    {
        var nx = PlayerX + dx;
        var ny = PlayerY + dy;

        if (!IsWall(nx + Math.Sign(dx) * PlayerRadius, PlayerY) && !CreatureBlocks(nx, PlayerY))
            PlayerX = nx;
        if (!IsWall(PlayerX, ny + Math.Sign(dy) * PlayerRadius) && !CreatureBlocks(PlayerX, ny))
            PlayerY = ny;
    }

    private bool CreatureBlocks(double x, double y)
    {
        foreach (var c in Creatures)
        {
            if (c.Calmed) continue;
            var d = Math.Sqrt((c.X - x) * (c.X - x) + (c.Y - y) * (c.Y - y));
            if (d < PlayerRadius + CreatureRadius) return true;
        }
        return false;
    }

    private void UpdateCreatures(double dt, bool watchHeld, bool isMoving)
    {
        Creature? focused = null;
        var bestAngle = WatchHalfAngle;

        foreach (var c in Creatures)
        {
            if (c.Calmed) continue;
            var dx = c.X - PlayerX;
            var dy = c.Y - PlayerY;
            var dist = Math.Sqrt(dx * dx + dy * dy);
            var angleTo = Math.Atan2(dy, dx);
            var rel = NormalizeAngle(angleTo - PlayerAngle);

            if (dist <= WatchRange && Math.Abs(rel) <= bestAngle)
            {
                focused = c;
                bestAngle = Math.Abs(rel);
            }
        }

        foreach (var c in Creatures)
        {
            if (c.Calmed) continue;
            if (c == focused && watchHeld && !isMoving)
            {
                c.CalmProgress = Math.Min(1.0, c.CalmProgress + dt / CalmSeconds);
                if (c.CalmProgress >= 1.0)
                {
                    c.Calmed = true;
                    CalmedCount++;
                    ShowToast($"{c.DisplayName} sat down beside you. ✨");
                }
            }
            else
            {
                c.CalmProgress = Math.Max(0.0, c.CalmProgress - dt / (CalmSeconds * 0.6));
            }
        }

        FocusedCreature = focused;
    }

    public Creature? FocusedCreature { get; private set; }

    private void ShowToast(string message)
    {
        Toast = message;
        _toastTimer = 3.2;
    }

    private static double NormalizeAngle(double a)
    {
        while (a > Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
    }

    /// <summary>Casts one ray and returns (perpendicular distance, wall type).</summary>
    public (double dist, int wallType) CastRay(double angle)
    {
        var dirX = Math.Cos(angle);
        var dirY = Math.Sin(angle);
        const double step = 0.02;
        const double maxDist = 20.0;

        var dist = 0.0;
        while (dist < maxDist)
        {
            dist += step;
            var x = PlayerX + dirX * dist;
            var y = PlayerY + dirY * dist;
            var col = (int)Math.Floor(x);
            var row = (int)Math.Floor(y);
            if (col < 0 || row < 0 || col >= MapWidth || row >= MapHeight)
                return (dist * Math.Cos(angle - PlayerAngle), 1);

            var wallType = _walls[row, col];
            if (wallType != 0)
                return (dist * Math.Cos(angle - PlayerAngle), wallType);
        }

        return (maxDist, 0);
    }
}

public sealed class Creature
{
    /// <summary>1 = Chanchal (monkey), 2 = Bhaari (elephant), 3 = Shaan (peacock). Mirrors the JS-side emoji lookup.</summary>
    public int TypeCode { get; }
    public string Emoji { get; }
    public double X { get; }
    public double Y { get; }
    public string DisplayName { get; }
    public bool Calmed { get; set; }
    public double CalmProgress { get; set; }

    public Creature(int typeCode, string emoji, double x, double y, string displayName)
    {
        TypeCode = typeCode;
        Emoji = emoji;
        X = x;
        Y = y;
        DisplayName = displayName;
    }
}
