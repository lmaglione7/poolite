import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PressableScale } from '../../src/components/PressableScale';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAddresses } from '../../src/state/AddressContext';
import { isValidCap, isValidPhone, isValidProvince } from '../../src/data/provinces';

const LABELS = ['Casa', 'Ufficio', 'Altro'];

// Handles both "nuovo" and editing an existing id — same form, one file.
export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, save } = useAddresses();
  const existing = id && id !== 'nuovo' ? getById(id) : undefined;

  const [label, setLabel] = useState(existing?.label ?? 'Casa');
  const [firstName, setFirstName] = useState(existing?.firstName ?? '');
  const [lastName, setLastName] = useState(existing?.lastName ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [street, setStreet] = useState(existing?.street ?? '');
  const [extra, setExtra] = useState(existing?.extra ?? '');
  const [cap, setCap] = useState(existing?.cap ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [province, setProvince] = useState(existing?.province ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? false);
  const [touched, setTouched] = useState(false);

  const errors = {
    firstName: !firstName.trim() ? 'Serve il nome' : null,
    lastName: !lastName.trim() ? 'Serve il cognome' : null,
    phone: !isValidPhone(phone) ? 'Numero non valido: serve al corriere per avvisarti' : null,
    street: street.trim().length < 5 ? 'Scrivi via e numero civico' : null,
    cap: !isValidCap(cap) ? 'Il CAP ha 5 cifre' : null,
    city: !city.trim() ? 'Serve la città' : null,
    province: !isValidProvince(province) ? 'Sigla provincia non valida (es. MI)' : null,
  };
  const valid = Object.values(errors).every((e) => e === null);

  function submit() {
    setTouched(true);
    if (!valid) return;
    save({
      id: existing?.id,
      label,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      extra: extra.trim(),
      cap: cap.trim(),
      city: city.trim(),
      province: province.trim().toUpperCase(),
      notes: notes.trim(),
      isDefault,
    });
    router.back();
  }

  function field(
    labelText: string,
    value: string,
    onChange: (t: string) => void,
    opts: { error?: string | null; placeholder?: string; keyboardType?: 'default' | 'phone-pad' | 'number-pad'; maxLength?: number; autoCap?: 'none' | 'words' | 'characters' } = {}
  ) {
    const showError = touched && opts.error;
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.fieldLabel}>{labelText}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={opts.placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={opts.keyboardType ?? 'default'}
          maxLength={opts.maxLength}
          autoCapitalize={opts.autoCap ?? 'words'}
          style={[styles.input, showError ? { borderColor: colors.error } : null]}
        />
        {showError && <Text style={styles.errorText}>{opts.error}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backChevron}>‹</Text>
            </PressableScale>
            <Text style={styles.title}>{existing ? 'Modifica indirizzo' : 'Nuovo indirizzo'}</Text>
          </View>
          <WaveDivider />

          <Text style={styles.fieldLabel}>Etichetta</Text>
          <View style={styles.labelRow}>
            {LABELS.map((l) => (
              <PressableScale
                key={l}
                haptic={false}
                onPress={() => setLabel(l)}
                style={[styles.labelChip, label === l && { backgroundColor: colors.selectedBg, borderColor: colors.accent }]}
              >
                <Text style={[styles.labelChipText, label === l && { color: colors.primary }]}>{l}</Text>
              </PressableScale>
            ))}
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>{field('Nome', firstName, setFirstName, { error: errors.firstName, placeholder: 'Mario' })}</View>
            <View style={{ flex: 1 }}>{field('Cognome', lastName, setLastName, { error: errors.lastName, placeholder: 'Rossi' })}</View>
          </View>

          {field('Telefono', phone, setPhone, { error: errors.phone, placeholder: '333 1234567', keyboardType: 'phone-pad' })}
          {field('Via e numero civico', street, setStreet, { error: errors.street, placeholder: 'Via Roma 12' })}
          {field('Scala, interno, citofono', extra, setExtra, { placeholder: 'Facoltativo' })}

          <View style={styles.twoCols}>
            <View style={{ width: 110 }}>
              {field('CAP', cap, setCap, { error: errors.cap, placeholder: '20900', keyboardType: 'number-pad', maxLength: 5 })}
            </View>
            <View style={{ flex: 1 }}>{field('Città', city, setCity, { error: errors.city, placeholder: 'Monza' })}</View>
            <View style={{ width: 80 }}>
              {field('Prov.', province, setProvince, { error: errors.province, placeholder: 'MB', maxLength: 2, autoCap: 'characters' })}
            </View>
          </View>

          {field('Note per il corriere', notes, setNotes, { placeholder: 'Es: lasciare dal vicino al piano terra' })}

          <View style={styles.defaultRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Usa come predefinito</Text>
              <Text style={styles.rowSub}>Sarà preselezionato al momento dell’ordine</Text>
            </View>
            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: colors.accent }} />
          </View>

          <PrimaryButton label="Salva indirizzo" onPress={submit} style={{ marginTop: 8 }} />
          {touched && !valid && <Text style={styles.formError}>Controlla i campi evidenziati in rosso.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 5, paddingHorizontal: 2 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, backgroundColor: colors.card, color: colors.textPrimary },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4, paddingHorizontal: 2 },
  labelRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  labelChip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.card },
  labelChipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  twoCols: { flexDirection: 'row', gap: 10 },
  defaultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 16 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  formError: { fontSize: 13, color: colors.error, textAlign: 'center', marginTop: 10, fontWeight: '600' },
});
