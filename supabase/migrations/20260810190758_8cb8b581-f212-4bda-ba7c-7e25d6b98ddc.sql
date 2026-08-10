CREATE POLICY "Users can update their own resumes"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'resumes' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'resumes' AND (auth.uid())::text = (storage.foldername(name))[1]);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;