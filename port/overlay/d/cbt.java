package d;

/**
 * Web port of the typed "cloud settings" store. The original merged values of several devices (Google Drive / backup);
 * here there is exactly one device, so every key type (Latest/Max/Sum/NotInCloud) degrades to plain local storage.
 */
public class cbt {
    ccm f;

    public cbt() {
        this.f = ccj.b();
    }

    public synchronized cee b(ccf<cee> ccfVar, cee ceeVar) {
        a(ccfVar, new cee(((cee) a(ccfVar)).a() + ceeVar.a()));
        return (cee) a(ccfVar);
    }

    public synchronized <T> void a(ccf<T> ccfVar, T t) {
        put(this.f, ccfVar.b(), t);
    }

    public synchronized <T> T a(ccf<T> ccfVar) {
        return get(this.f, ccfVar.b(), ccfVar.d(), ccfVar.e());
    }

    private void put(ccm ccmVar, String str, Object obj) {
        if (obj instanceof Integer) {
            ccmVar.a(str, ((Integer) obj).intValue());
        } else if (obj instanceof String) {
            ccmVar.a(str, (String) obj);
        } else if (obj instanceof cee) {
            ccmVar.b(str, (cee) obj);
        } else if (obj instanceof Boolean) {
            ccmVar.b(str, ((Boolean) obj).booleanValue());
        } else if (obj instanceof Long) {
            ccmVar.a(str, ((Long) obj).longValue());
        } else if (obj instanceof Float) {
            ccmVar.a(str, ((Float) obj).floatValue());
        } else {
            throw new RuntimeException("Unknown type " + str);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T get(ccm ccmVar, String str, T t, Class<T> cls) {
        if (cls == Integer.class) {
            return (T) Integer.valueOf(ccmVar.b(str, ((Integer) t).intValue()));
        }
        if (cls == String.class) {
            return (T) ccmVar.b(str, (String) t);
        }
        if (cls == cee.class) {
            return (T) ccmVar.a(str, (cee) t);
        }
        if (cls == Boolean.class) {
            return (T) Boolean.valueOf(ccmVar.c(str, ((Boolean) t).booleanValue()));
        }
        if (cls == Long.class) {
            return (T) Long.valueOf(ccmVar.b(str, ((Long) t).longValue()));
        }
        if (cls == Float.class) {
            return (T) Float.valueOf(ccmVar.b(str, ((Float) t).floatValue()));
        }
        throw new RuntimeException("unsupported pref type: " + str + " " + cls);
    }
}
