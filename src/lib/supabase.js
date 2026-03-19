import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uhowlnwzdivwztzuqppb.supabase.co'
const supabaseKey = 'sb_publishable_tVUheEf7iO1hVrQulfz6Mg_YI0zAvcV'

export const supabase = createClient(supabaseUrl, supabaseKey)