
def getPCas(x):
    if x < 0:
        raise Exception("GetPCas: x can't be lower than 0")
        #return -getPCas(-x)
    if x > 3: x = 3
    if x < 0.25: x = 0.25
    #coeff0 = -3.3787977002884051e-002
    #coeff1 = 1.5423744298612210e-001
    #coeff2 = 6.9606841743195008e-002
    coeff0 = -0.015
    coeff1 = 0.06
    coeff2 = 0.02

    return min(1, abs(coeff2 * (x ** 2) + coeff1 * x + coeff0))
