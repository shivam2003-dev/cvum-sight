q, n, psi, omega = 17, 4, 2, 4
assert pow(psi, 4, q) == q-1 and pow(psi, 8, q) == 1

def transform(a, inverse=False):
    w = pow(omega, -1, q) if inverse else omega
    scale = pow(n, -1, q) if inverse else 1
    return [sum(a[j]*pow(w, j*k, q) for j in range(n))*scale % q
            for k in range(n)]

def multiply(a, b):
    aa = transform([a[i]*pow(psi,i,q) % q for i in range(n)])
    bb = transform([b[i]*pow(psi,i,q) % q for i in range(n)])
    c = transform([x*y % q for x,y in zip(aa,bb)], inverse=True)
    return [c[i]*pow(psi,-i,q) % q for i in range(n)]

assert multiply([1,0,0,2], [3,1,0,0]) == [1,1,0,6]
assert [(3+5)%17, (3-5)%17] == [8,15]
print('Toy transform checks passed')
