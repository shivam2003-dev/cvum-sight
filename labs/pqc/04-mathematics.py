from itertools import product
from collections import Counter
assert (5 + 6) % 7 == 4
assert (5 * 6) % 7 == 2
assert (3 * 5) % 7 == 1
A, s, e = [[1, 2], [3, 4]], [2, 1], [1, -1]
assert [(sum(a*b for a, b in zip(row, s)) + z) % 7
        for row, z in zip(A, e)] == [5, 2]
counts = Counter(a+b-c-d for a,b,c,d in product([0,1], repeat=4))
assert [counts[i] for i in range(-2,3)] == [1,4,6,4,1]
a, b, out = [1,0,0,2], [3,1,0,0], [0]*4
for i in range(4):
    for j in range(4):
        k = i+j
        out[k % 4] += a[i]*b[j] * (1 if k < 4 else -1)
assert [v % 17 for v in out] == [1,1,0,6]
print('Mathematics examples passed')
