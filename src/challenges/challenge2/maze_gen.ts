
export function generateMaze(width: number, height: number): number[][] {
    const cols = width % 2 === 0 ? width + 1 : width;
    const rows = height % 2 === 0 ? height + 1 : height;

    const WALL = 1;
    const PATH = 0;

    const maze: number[][] = Array.from({ length: rows }, () => Array(cols).fill(WALL));

    const directions = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2]
    ];

    function shuffleArray(array: number[][]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function carvePassagesFrom(r: number, c: number): void {
        maze[r][c] = PATH;


        shuffleArray(directions);

        for (const [dr, dc] of directions) {
            const nextR = r + dr;
            const nextC = c + dc;

            if (nextR > 0 && nextR < rows - 1 && nextC > 0 && nextC < cols - 1 && maze[nextR][nextC] === WALL) {
                maze[r + dr / 2][c + dc / 2] = PATH;

                carvePassagesFrom(nextR, nextC);
            }
        }
    }

    carvePassagesFrom(1, 1);

    maze[1][0] = PATH;
    maze[rows - 2][cols - 1] = PATH;

    return maze;
}
