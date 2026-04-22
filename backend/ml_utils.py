def to_dense_array(x):
    return x.toarray() if hasattr(x, 'toarray') else x
