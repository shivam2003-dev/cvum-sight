from math import gcd
assert [pow(2, r, 15) for r in range(1, 5)] == [2, 4, 8, 1]
assert (gcd(4 - 1, 15), gcd(4 + 1, 15)) == (3, 5)
amplitudes = [-0.5, 0.5, 0.5, 0.5]
mean = sum(amplitudes) / len(amplitudes)
after = [2 * mean - a for a in amplitudes]
assert after == [1.0, 0.0, 0.0, 0.0]
assert sum(a * a for a in after) == 1.0
print('Toy arithmetic checks passed')
